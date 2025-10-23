import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { JoinTransactionPayload } from '@/types/transaction';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('Join - Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      hasError: !!authError,
    });

    if (authError || !user) {
      console.error('Join - Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const payload: JoinTransactionPayload = await request.json();
    console.log(
      'Join - Attempting to join transaction:',
      payload.transaction_id
    );

    // Check if transaction exists
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', payload.transaction_id)
      .single();

    if (transactionError || !transaction) {
      console.error('Join - Transaction not found:', {
        transactionId: payload.transaction_id,
        error: transactionError,
      });
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    console.log('Join - Transaction found:', transaction.id);

    // Check if user is trying to join their own transaction
    if (transaction.creator_id === user.id) {
      console.log('Join - User attempting to join their own transaction');
      return NextResponse.json(
        {
          error:
            'You cannot accept your own invitation link. Please share this link with someone else.',
        },
        { status: 400 }
      );
    }

    // Check participant count before attempting to add
    const { count } = await supabase
      .from('transaction_participants')
      .select('*', { count: 'exact', head: true })
      .eq('transaction_id', payload.transaction_id);

    if (count && count >= 2) {
      return NextResponse.json(
        { error: 'Transaction already has maximum participants' },
        { status: 400 }
      );
    }

    // Add user as participant
    console.log('Join - Adding user as participant...');
    const { data: participant, error: participantError } = await supabase
      .from('transaction_participants')
      .insert({
        transaction_id: payload.transaction_id,
        user_id: user.id,
        role: 'invitee',
      })
      .select()
      .single();

    if (participantError) {
      console.error('Join - Failed to add participant:', {
        code: participantError.code,
        message: participantError.message,
        details: participantError.details,
        hint: participantError.hint,
      });

      return NextResponse.json(
        { error: participantError.message || 'Failed to join transaction' },
        { status: 500 }
      );
    }

    console.log('Join - Participant added successfully:', participant.id);

    // Update transaction status to 'both_joined'
    console.log('Join - Updating transaction status to both_joined...');
    const { data: updateData, error: updateError } = await supabase
      .from('transactions')
      .update({ status: 'both_joined' })
      .eq('id', payload.transaction_id)
      .select();

    if (updateError) {
      console.error('Join - Failed to update transaction status:', updateError);
    } else {
      console.log('Join - Transaction status updated:', updateData);
    }

    // Broadcast update to all clients subscribed to this transaction
    // This works without database replication enabled
    const channel = supabase.channel(`transaction:${payload.transaction_id}`);
    await channel.send({
      type: 'broadcast',
      event: 'transaction_update',
      payload: {
        type: 'participant_joined',
        transaction_id: payload.transaction_id,
        user_id: user.id,
      },
    });

    return NextResponse.json({
      participant,
      transaction,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
