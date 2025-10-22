import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ConfirmEscrowPayload } from '@/types/escrow';

/**
 * POST /api/escrow/confirm
 *
 * Allows a party to confirm completion of the escrow deliverable.
 * If both parties confirm, the escrow is automatically completed.
 *
 * @param request - NextRequest with ConfirmEscrowPayload in body
 * @returns NextResponse with updated escrow or error
 */
export async function POST(request: NextRequest) {
  try {
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

    // Parse request body
    const body = (await request.json()) as ConfirmEscrowPayload;

    if (!body.escrow_id) {
      return NextResponse.json(
        { error: 'Validation error', details: 'escrow_id is required' },
        { status: 400 }
      );
    }

    // Fetch the escrow
    const { data: escrow, error: fetchError } = await supabase
      .from('escrows')
      .select('*')
      .eq('id', body.escrow_id)
      .single();

    if (fetchError || !escrow) {
      return NextResponse.json(
        { error: 'Escrow not found', details: fetchError?.message },
        { status: 404 }
      );
    }

    // Validate user is part of this escrow
    const isInitiator = escrow.initiator_id === user.id;
    const isParticipant = escrow.participant_id === user.id;

    if (!isInitiator && !isParticipant) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: 'You are not a party to this escrow',
        },
        { status: 403 }
      );
    }

    // Validate escrow status
    if (!['active', 'awaiting_confirmation'].includes(escrow.status)) {
      return NextResponse.json(
        {
          error: 'Invalid operation',
          details: `Cannot confirm escrow with status: ${escrow.status}`,
        },
        { status: 400 }
      );
    }

    // Check if user already confirmed
    if (
      (isInitiator && escrow.initiator_confirmation === 'confirmed') ||
      (isParticipant && escrow.participant_confirmation === 'confirmed')
    ) {
      return NextResponse.json(
        {
          error: 'Invalid operation',
          details: 'You have already confirmed this escrow',
        },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (isInitiator) {
      updateData.initiator_confirmation = 'confirmed';
      updateData.initiator_confirmed_at = new Date().toISOString();
    } else {
      updateData.participant_confirmation = 'confirmed';
      updateData.participant_confirmed_at = new Date().toISOString();
    }

    // Check if this is the first confirmation
    const otherPartyConfirmed = isInitiator
      ? escrow.participant_confirmation === 'confirmed'
      : escrow.initiator_confirmation === 'confirmed';

    if (otherPartyConfirmed) {
      // Both parties confirmed - complete the escrow
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    } else {
      // First confirmation - update status to awaiting_confirmation
      updateData.status = 'awaiting_confirmation';
    }

    // Update escrow
    const { data: updatedEscrow, error: updateError } = await supabase
      .from('escrows')
      .update(updateData)
      .eq('id', body.escrow_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error confirming escrow:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm escrow', details: updateError.message },
        { status: 500 }
      );
    }

    // Create event
    const eventType = isInitiator
      ? 'initiator_confirmed'
      : 'participant_confirmed';

    await supabase.from('escrow_events').insert({
      escrow_id: body.escrow_id,
      event_type: eventType,
      actor_id: user.id,
      details: body.confirmation_notes
        ? { notes: body.confirmation_notes }
        : null,
    });

    // If completed, create completion event
    if (updateData.status === 'completed') {
      await supabase.from('escrow_events').insert({
        escrow_id: body.escrow_id,
        event_type: 'completed',
        actor_id: user.id,
      });
    }

    return NextResponse.json({
      success: true,
      escrow: updatedEscrow,
      message:
        updateData.status === 'completed'
          ? 'Escrow completed successfully'
          : 'Confirmation recorded, waiting for other party',
    });
  } catch (error) {
    console.error('Unexpected error in /api/escrow/confirm:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
