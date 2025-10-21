import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { RequestArbiterPayload } from '@/types/escrow';

/**
 * POST /api/escrow/request-arbiter
 *
 * Allows a party to request arbiter intervention for dispute resolution.
 *
 * @param request - NextRequest with RequestArbiterPayload in body
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
    const body = (await request.json()) as RequestArbiterPayload;

    if (!body.escrow_id || !body.dispute_reason || !body.dispute_details) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details:
            'escrow_id, dispute_reason, and dispute_details are required',
        },
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
          details: `Cannot request arbiter for escrow with status: ${escrow.status}`,
        },
        { status: 400 }
      );
    }

    // Check if arbiter already requested
    if (escrow.arbiter_requested) {
      return NextResponse.json(
        {
          error: 'Invalid operation',
          details: 'Arbiter has already been requested for this escrow',
        },
        { status: 400 }
      );
    }

    // Update escrow status to disputed and mark arbiter as requested
    const { data: updatedEscrow, error: updateError } = await supabase
      .from('escrows')
      .update({
        status: 'disputed',
        arbiter_requested: true,
        arbiter_decision: 'pending',
      })
      .eq('id', body.escrow_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error requesting arbiter:', updateError);
      return NextResponse.json(
        { error: 'Failed to request arbiter', details: updateError.message },
        { status: 500 }
      );
    }

    // Update confirmation status for the disputing party
    const confirmationUpdate: Record<string, unknown> = {};
    if (isInitiator) {
      confirmationUpdate.initiator_confirmation = 'disputed';
    } else {
      confirmationUpdate.participant_confirmation = 'disputed';
    }

    await supabase
      .from('escrows')
      .update(confirmationUpdate)
      .eq('id', body.escrow_id);

    // Create dispute event
    await supabase.from('escrow_events').insert({
      escrow_id: body.escrow_id,
      event_type: 'arbiter_requested',
      actor_id: user.id,
      details: {
        reason: body.dispute_reason,
        details: body.dispute_details,
        evidence_urls: body.evidence_urls || [],
      },
    });

    // TODO: In production, this would:
    // 1. Notify Sabot admin/arbiter team
    // 2. Create a ticket in dispute resolution system
    // 3. Send notifications to both parties
    console.log(
      `Arbiter requested for escrow ${body.escrow_id} by user ${user.id}`
    );
    console.log(`Dispute reason: ${body.dispute_reason}`);
    console.log(`Dispute details: ${body.dispute_details}`);

    return NextResponse.json({
      success: true,
      escrow: updatedEscrow,
      message:
        'Arbiter requested successfully. You will be notified when an arbiter is assigned.',
    });
  } catch (error) {
    console.error('Unexpected error in /api/escrow/request-arbiter:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
