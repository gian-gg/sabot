import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type {
  EscrowStatusResponse,
  EscrowWithParticipants,
  PartyRole,
} from '@/types/escrow';

/**
 * GET /api/escrow/[id]/status
 *
 * Fetches detailed status information for an escrow transaction.
 *
 * @param request - NextRequest
 * @param params - Route parameters containing escrow ID
 * @returns NextResponse with escrow status or error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'User must be authenticated' },
        { status: 401 }
      );
    }

    // Fetch escrow with basic details
    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', id)
      .single();

    if (escrowError || !escrow) {
      return NextResponse.json(
        { error: 'Escrow not found', details: escrowError?.message },
        { status: 404 }
      );
    }

    // Determine current user's role
    let currentUserRole: PartyRole | undefined;
    if (escrow.initiator_id === user.id) {
      currentUserRole = 'initiator';
    } else if (escrow.participant_id === user.id) {
      currentUserRole = 'participant';
    }

    // Verify user has access to this escrow
    if (!currentUserRole && escrow.arbiter_id !== user.id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          details: 'You do not have access to this escrow',
        },
        { status: 403 }
      );
    }

    // Fetch initiator details
    const { data: initiatorData } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data')
      .eq('id', escrow.initiator_id)
      .single();

    // Fetch participant details if exists
    let participantData = null;
    if (escrow.participant_id) {
      const { data } = await supabase
        .from('auth.users')
        .select('id, email, raw_user_meta_data')
        .eq('id', escrow.participant_id)
        .single();
      participantData = data;
    }

    // Fetch arbiter details if exists
    let arbiterData = null;
    if (escrow.arbiter_id) {
      const { data } = await supabase
        .from('auth.users')
        .select('id, email, raw_user_meta_data')
        .eq('id', escrow.arbiter_id)
        .single();
      arbiterData = data;
    }

    // Fetch escrow events
    const { data: events, error: eventsError } = await supabase
      .from('escrow_events')
      .select('*')
      .eq('escrow_id', id)
      .order('timestamp', { ascending: true });

    if (eventsError) {
      console.error('Error fetching escrow events:', eventsError);
    }

    // Build response with participant details
    const escrowWithParticipants: EscrowWithParticipants = {
      ...escrow,
      initiator: {
        id: initiatorData?.id || escrow.initiator_id,
        name:
          initiatorData?.raw_user_meta_data?.full_name || 'Unknown Initiator',
        email: initiatorData?.email || '',
        avatar: initiatorData?.raw_user_meta_data?.avatar_url,
        isVerified: false, // TODO: Check verification status
      },
      participant: participantData
        ? {
            id: participantData.id,
            name:
              participantData.raw_user_meta_data?.full_name ||
              'Unknown Participant',
            email: participantData.email || '',
            avatar: participantData.raw_user_meta_data?.avatar_url,
            isVerified: false, // TODO: Check verification status
          }
        : undefined,
      arbiter: arbiterData
        ? {
            id: arbiterData.id,
            name: arbiterData.raw_user_meta_data?.full_name || 'Arbiter',
            email: arbiterData.email || '',
          }
        : undefined,
    };

    // Determine action permissions
    const canConfirm =
      currentUserRole &&
      ['active', 'awaiting_confirmation'].includes(escrow.status) &&
      ((currentUserRole === 'initiator' &&
        escrow.initiator_confirmation !== 'confirmed') ||
        (currentUserRole === 'participant' &&
          escrow.participant_confirmation !== 'confirmed'));

    const canDispute =
      currentUserRole &&
      ['active', 'awaiting_confirmation'].includes(escrow.status) &&
      !escrow.arbiter_requested;

    const canCancel =
      currentUserRole === 'initiator' && escrow.status === 'pending';

    const response: EscrowStatusResponse = {
      escrow: escrowWithParticipants,
      events: events || [],
      current_user_role: currentUserRole,
      can_confirm: !!canConfirm,
      can_dispute: !!canDispute,
      can_cancel: !!canCancel,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in /api/escrow/[id]/status:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
