import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { JoinAgreementPayload } from '@/types/agreement';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('Join - Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      hasError: !!authError,
    });

    if (authError || !user) {
      console.error('Join - Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const payload: JoinAgreementPayload = await request.json();
    console.log('Join - Attempting to join agreement:', payload.agreement_id);

    // Check if agreement exists
    const { data: agreement, error: agreementError } = await supabase
      .from('agreements')
      .select('*')
      .eq('id', payload.agreement_id)
      .single();

    if (agreementError || !agreement) {
      console.error('Join - Agreement not found:', {
        agreementId: payload.agreement_id,
        error: agreementError,
      });
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    console.log('Join - Agreement found:', agreement.id);

    // Check if user is trying to join their own agreement
    if (agreement.creator_id === user.id) {
      console.log('Join - User attempting to join their own agreement');
      return NextResponse.json(
        {
          error:
            'You cannot accept your own invitation link. Please share this link with someone else.',
        },
        { status: 400 }
      );
    }

    // Check participant count before attempting to add
    const { count } = await supabase
      .from('agreement_participants')
      .select('*', { count: 'exact', head: true })
      .eq('agreement_id', payload.agreement_id);

    if (count && count >= 2) {
      return NextResponse.json(
        { error: 'Agreement already has maximum participants' },
        { status: 400 }
      );
    }

    // Get invitee info from user metadata
    const inviteeName = user.user_metadata?.name || 'Invitee';
    const inviteeEmail = user.email || '';
    // Use avatar_url from user metadata
    const inviteeAvatarUrl =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      undefined;

    console.log('Join - Invitee data to store:', {
      inviteeName,
      inviteeEmail,
      inviteeAvatarUrl,
    });

    // Add user as participant with profile data
    console.log('Join - Adding user as participant...');
    const { data: participant, error: participantError } = await supabase
      .from('agreement_participants')
      .insert({
        agreement_id: payload.agreement_id,
        user_id: user.id,
        role: 'invitee',
        name: inviteeName,
        email: inviteeEmail,
        avatar: inviteeAvatarUrl,
      })
      .select()
      .single();

    if (participantError) {
      console.error('Join - Failed to add participant:', {
        code: participantError.code,
        message: participantError.message,
        details: participantError.details,
        hint: participantError.hint,
      });

      return NextResponse.json(
        { error: participantError.message || 'Failed to join agreement' },
        { status: 500 }
      );
    }

    console.log('Join - Participant added successfully:', participant.id);

    // Update agreement with invitee data and status to 'both_joined'
    console.log(
      'Join - Updating agreement with invitee data and status to both_joined...'
    );
    console.log('Join - Avatar URL to store:', inviteeAvatarUrl);
    const { data: updateData, error: updateError } = await supabase
      .from('agreements')
      .update({
        status: 'both_joined',
        invitee_id: user.id,
        invitee_name: inviteeName,
        invitee_email: inviteeEmail,
        invitee_avatar_url: inviteeAvatarUrl,
      })
      .eq('id', payload.agreement_id)
      .select();

    if (updateError) {
      console.error('Join - Failed to update agreement status:', updateError);
    } else {
      console.log('Join - Agreement status updated:', updateData);
      console.log(
        'Join - Invitee avatar URL stored:',
        updateData?.[0]?.invitee_avatar_url
      );
    }

    // Broadcast update to all clients subscribed to this agreement
    const channel = supabase.channel(`agreement:${payload.agreement_id}`);
    await channel.send({
      type: 'broadcast',
      event: 'agreement_update',
      payload: {
        type: 'participant_joined',
        agreement_id: payload.agreement_id,
        user_id: user.id,
      },
    });

    return NextResponse.json({
      participant,
      agreement,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
