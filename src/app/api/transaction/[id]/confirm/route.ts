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

    // Get transaction first to check status
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (transactionError || !transaction) {
      console.error('Error fetching transaction:', transactionError);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Only allow confirmation when transaction is active
    if (transaction.status !== 'active') {
      return NextResponse.json(
        {
          error: 'Transaction must be in active status to confirm',
          current_status: transaction.status,
        },
        { status: 400 }
      );
    }

    // Check if user is a participant in this transaction
    const { data: participant, error: participantError } = await supabase
      .from('transaction_participants')
      .select('*')
      .eq('transaction_id', id)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      console.error('Error fetching participant:', participantError);
      return NextResponse.json(
        { error: 'Not a participant of this transaction' },
        { status: 403 }
      );
    }

    // Check if already confirmed
    if (participant.has_confirmed) {
      return NextResponse.json(
        { error: 'You have already confirmed this transaction' },
        { status: 400 }
      );
    }

    console.log('Confirming transaction participant:', {
      transactionId: id,
      userId: user.id,
      participantId: participant.id,
    });

    // Update participant confirmation
    const { data: updateResult, error: updateError } = await supabase
      .from('transaction_participants')
      .update({
        has_confirmed: true,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', participant.id)
      .select();

    if (updateError) {
      console.error('Error confirming participant:', updateError);
      return NextResponse.json(
        {
          error: 'Failed to confirm participation',
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    if (!updateResult?.length) {
      console.error('Confirmation update had no effect');
      return NextResponse.json(
        { error: 'Confirmation update failed', details: 'No rows updated' },
        { status: 500 }
      );
    }

    console.log('Successfully confirmed participant:', {
      transactionId: id,
      userId: user.id,
      participantId: participant.id,
      updateResult,
    });

    // Check if both participants have confirmed
    const { data: allParticipants, error: participantsError } = await supabase
      .from('transaction_participants')
      .select('has_confirmed')
      .eq('transaction_id', id);

    if (participantsError) {
      console.error('Error checking participants:', participantsError);
      return NextResponse.json(
        { error: 'Failed to check participant status' },
        { status: 500 }
      );
    }

    const bothConfirmed =
      allParticipants?.every((p) => p.has_confirmed) || false;

    // If both confirmed, update transaction status to completed
    if (bothConfirmed) {
      const { error: transactionUpdateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
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

    // Broadcast update to all clients subscribed to this transaction
    const channel = supabase.channel(`transaction:${id}`);
    await channel.send({
      type: 'broadcast',
      event: 'transaction_update',
      payload: {
        type: 'participant_confirmed',
        transaction_id: id,
        user_id: user.id,
        both_confirmed: bothConfirmed,
      },
    });

    return NextResponse.json({
      success: true,
      both_confirmed: bothConfirmed,
      message: bothConfirmed
        ? 'Both participants confirmed! Transaction is now completed.'
        : 'Confirmation recorded. Waiting for other participant.',
    });
  } catch (error) {
    console.error('Error confirming transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
