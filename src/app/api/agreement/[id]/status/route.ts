import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: agreementId } = await params;

    // Get agreement
    const { data: agreement, error: agreementError } = await supabase
      .from('agreements')
      .select('*')
      .eq('id', agreementId)
      .single();

    if (agreementError || !agreement) {
      console.error('Status - Agreement not found:', agreementError);
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Get participants with their profile data
    const { data: participants, error: participantsError } = await supabase
      .from('agreement_participants')
      .select(
        `
        id,
        agreement_id,
        user_id,
        role,
        participant_name,
        participant_email,
        participant_avatar_url,
        has_confirmed,
        confirmed_at,
        has_signed,
        signed_at,
        joined_at
      `
      )
      .eq('agreement_id', agreementId);

    if (participantsError) {
      console.error(
        'Status - Failed to fetch participants:',
        participantsError
      );
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    // Enrich participants with data from agreement table
    const participantsData = (participants || []).map((participant) => {
      if (participant.role === 'creator') {
        // Use creator data from agreement table
        return {
          ...participant,
          participant_name:
            participant.participant_name ||
            agreement.creator_name ||
            'Agreement Creator',
          participant_email:
            participant.participant_email || agreement.creator_email || '',
          participant_avatar_url:
            participant.participant_avatar_url ||
            agreement.creator_avatar_url ||
            undefined,
        };
      }
      // Use invitee data from agreement table
      return {
        ...participant,
        participant_name:
          participant.participant_name || agreement.invitee_name || 'Invitee',
        participant_email:
          participant.participant_email || agreement.invitee_email || '',
        participant_avatar_url:
          participant.participant_avatar_url ||
          agreement.invitee_avatar_url ||
          undefined,
      };
    });

    // Determine current user's role
    const currentUserParticipant = participants?.find(
      (p) => p.user_id === user.id
    );
    const currentUserRole = currentUserParticipant?.role;

    // Check if ready for next step (both joined)
    const isReadyForNextStep = participantsData?.length === 2;
    const bothJoined = participantsData?.length === 2;

    console.log(`📊 Status API [${agreementId.slice(0, 8)}]:`, {
      status: agreement.status,
      participantCount: participantsData?.length,
      bothJoined,
      is_ready_for_next_step: isReadyForNextStep,
      user: user.id.slice(0, 8),
      hasTerms: !!agreement.terms,
      hasDeliverables: !!agreement.deliverables,
    });

    return NextResponse.json({
      agreement,
      participants: participantsData,
      current_user_role: currentUserRole,
      is_ready_for_next_step: isReadyForNextStep,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
