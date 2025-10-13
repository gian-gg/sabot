import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get deliverable details
    const { data: deliverable, error: deliverableError } = await supabase
      .from('deliverables')
      .select('*, escrow:escrows(*)')
      .eq('id', id)
      .single();

    if (deliverableError || !deliverable) {
      return NextResponse.json(
        { error: 'Deliverable not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to confirm this deliverable
    // Only the receiver (opposing party) can confirm a deliverable
    const isReceiver =
      deliverable.party_responsible !== 'initiator' &&
      deliverable.escrow?.participant_id === user.id;
    const isInitiatorReceiver =
      deliverable.party_responsible === 'initiator' &&
      deliverable.escrow?.initiator_id === user.id;

    // User can only confirm if they are the receiver of the deliverable
    if (!isReceiver && !isInitiatorReceiver) {
      return NextResponse.json(
        { error: 'Only the receiver can confirm this deliverable' },
        { status: 403 }
      );
    }

    // Update deliverable status to confirmed
    const { error: updateError } = await supabase
      .from('deliverables')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error confirming deliverable:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm deliverable' },
        { status: 500 }
      );
    }

    // Check if all deliverables are confirmed
    const { data: allDeliverables, error: deliverablesError } = await supabase
      .from('deliverables')
      .select('status')
      .eq('escrow_id', deliverable.escrow_id);

    if (deliverablesError) {
      console.error('Error checking deliverables:', deliverablesError);
    } else {
      const allConfirmed =
        allDeliverables?.every((d) => d.status === 'confirmed') || false;

      if (allConfirmed) {
        // All deliverables confirmed - update escrow status
        const { error: escrowUpdateError } = await supabase
          .from('escrows')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', deliverable.escrow_id);

        if (escrowUpdateError) {
          console.error('Error updating escrow status:', escrowUpdateError);
        }
      }
    }

    // Broadcast update
    const channel = supabase.channel(
      `transaction:${deliverable.escrow?.transaction_id}`
    );
    await channel.send({
      type: 'broadcast',
      event: 'deliverable_confirmed',
      payload: {
        deliverable_id: id,
        user_id: user.id,
        escrow_id: deliverable.escrow_id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Deliverable confirmed successfully',
    });
  } catch (error) {
    console.error('Error confirming deliverable:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
