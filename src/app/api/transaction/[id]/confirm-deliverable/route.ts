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

    // Parse request body
    const { deliverableType } = await request.json();

    // Check if user is a participant in this transaction
    const { data: participant, error: participantError } = await supabase
      .from('transaction_participants')
      .select('*')
      .eq('transaction_id', id)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Not a participant of this transaction' },
        { status: 403 }
      );
    }

    // Determine if user can confirm this deliverable type
    // Item deliverable: creator (seller) can confirm (they delivered the item)
    // Payment deliverable: participant (buyer) can confirm (they received the payment)
    const canConfirm =
      (deliverableType === 'item' && participant.role === 'creator') ||
      (deliverableType === 'payment' && participant.role === 'invitee');

    if (!canConfirm) {
      return NextResponse.json(
        { error: 'You cannot confirm this deliverable' },
        { status: 403 }
      );
    }

    // Update participant's deliverable confirmation status
    const updateField =
      deliverableType === 'item' ? 'item_confirmed' : 'payment_confirmed';
    const timestampField =
      deliverableType === 'item' ? 'item_confirmed_at' : 'payment_confirmed_at';

    const { data: updatedParticipant, error: updateError } = await supabase
      .from('transaction_participants')
      .update({
        [updateField]: true,
        [timestampField]: new Date().toISOString(),
      })
      .eq('id', participant.id)
      .select()
      .single();

    console.log('Updated participant:', updatedParticipant, updateError);

    if (updateError) {
      console.error('Error confirming deliverable:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm deliverable' },
        { status: 500 }
      );
    }

    // Also mark the other participant(s) as confirmed for this deliverable
    // This ensures the other party's record is updated in the DB as requested.
    try {
      const { data: otherUpdated, error: otherUpdateError } = await supabase
        .from('transaction_participants')
        .update({
          [updateField]: true,
          [timestampField]: new Date().toISOString(),
        })
        .neq('user_id', user.id)
        .eq('transaction_id', id)
        .select();

      if (otherUpdateError) {
        console.error(
          'Error confirming other participant deliverable:',
          otherUpdateError
        );
      } else {
        console.log('Also updated other participant(s):', otherUpdated);
      }
    } catch (err) {
      console.error('Error updating other participant deliverable:', err);
    }
    // Check if all deliverables are confirmed by both parties
    const { data: allParticipants, error: participantsError } = await supabase
      .from('transaction_participants')
      .select('item_confirmed, payment_confirmed')
      .eq('transaction_id', id);

    if (participantsError) {
      console.error('Error checking participants:', participantsError);
    } else {
      const allItemConfirmed =
        allParticipants?.every((p) => p.item_confirmed) || false;
      const allPaymentConfirmed =
        allParticipants?.every((p) => p.payment_confirmed) || false;
      const allDeliverablesConfirmed = allItemConfirmed && allPaymentConfirmed;

      if (allDeliverablesConfirmed) {
        // Update transaction status to indicate all deliverables are confirmed
        const { error: transactionUpdateError } = await supabase
          .from('transactions')
          .update({
            status: 'active', // Ready for final confirmation
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (transactionUpdateError) {
          console.error(
            'Error updating transaction status:',
            transactionUpdateError
          );
        }
      }
    }

    // Broadcast update
    const channel = supabase.channel(`transaction:${id}`);
    await channel.send({
      type: 'broadcast',
      event: 'deliverable_confirmed',
      payload: {
        deliverable_type: deliverableType,
        user_id: user.id,
        transaction_id: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${deliverableType} confirmed successfully`,
      deliverableType,
      participant: updatedParticipant,
    });
  } catch (error) {
    console.error('Error confirming deliverable:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
