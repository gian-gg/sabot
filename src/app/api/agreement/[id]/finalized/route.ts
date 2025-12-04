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
      console.error('Finalized - Agreement not found:', agreementError);
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    // Get all participants with their profile data
    const { data: participants, error: participantsError } = await supabase
      .from('agreement_participants')
      .select(
        `
        id,
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
        'Finalized - Failed to fetch participants:',
        participantsError
      );
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    // Format participants with data from agreement table
    const formattedParticipants = (participants || []).map((participant) => {
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

    return NextResponse.json({
      agreement,
      participants: formattedParticipants,
    });
  } catch (error) {
    console.error('Finalized - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
