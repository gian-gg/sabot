import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { JoinEscrowPayload } from '@/types/escrow';

/**
 * POST /api/escrow/join
 *
 * Allows a user to join an existing escrow as a participant.
 *
 * @param request - NextRequest with JoinEscrowPayload in body
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
    const body = (await request.json()) as JoinEscrowPayload;

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

    // Validate escrow can be joined
    if (escrow.status !== 'pending') {
      return NextResponse.json(
        {
          error: 'Invalid operation',
          details: 'Escrow is not in pending status',
        },
        { status: 400 }
      );
    }

    if (escrow.participant_id) {
      return NextResponse.json(
        {
          error: 'Invalid operation',
          details: 'Escrow already has a participant',
        },
        { status: 400 }
      );
    }

    if (escrow.initiator_id === user.id) {
      return NextResponse.json(
        {
          error: 'Invalid operation',
          details: 'Cannot join your own escrow as participant',
        },
        { status: 400 }
      );
    }

    // Update escrow with participant
    const { data: updatedEscrow, error: updateError } = await supabase
      .from('escrows')
      .update({
        participant_id: user.id,
        status: 'active',
      })
      .eq('id', body.escrow_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error joining escrow:', updateError);
      return NextResponse.json(
        { error: 'Failed to join escrow', details: updateError.message },
        { status: 500 }
      );
    }

    // Create event
    await supabase.from('escrow_events').insert({
      escrow_id: body.escrow_id,
      event_type: 'participant_joined',
      actor_id: user.id,
    });

    return NextResponse.json({
      success: true,
      escrow: updatedEscrow,
      message: 'Successfully joined escrow',
    });
  } catch (error) {
    console.error('Unexpected error in /api/escrow/join:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
