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
    console.log(
      'Status - Fetching agreement:',
      agreementId,
      'for user:',
      user.id
    );

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

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('agreement_participants')
      .select(
        `
        id,
        agreement_id,
        user_id,
        role,
        has_confirmed,
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

    // Enrich participants with creator profile info from the agreement table
    const participantsData = (participants || []).map((participant) => {
      if (participant.role === 'creator') {
        return {
          ...participant,
          name: agreement.creator_name || 'Agreement Creator',
          email: agreement.creator_email || '',
          avatar: agreement.creator_avatar_url || undefined,
        };
      }
      return participant;
    });

    // Determine current user's role
    const currentUserParticipant = participants?.find(
      (p) => p.user_id === user.id
    );
    const currentUserRole = currentUserParticipant?.role;

    // Check if ready for next step (both joined)
    const isReadyForNextStep = participantsData?.length === 2;

    console.log('Status - Response:', {
      agreementId,
      status: agreement.status,
      participantCount: participantsData?.length,
      isReadyForNextStep,
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
