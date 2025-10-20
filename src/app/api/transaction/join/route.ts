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

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const payload: JoinTransactionPayload = await request.json();

    // Check if transaction exists
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', payload.transaction_id)
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if user is already a participant
    const { data: existingParticipant } = await supabase
      .from('transaction_participants')
      .select('*')
      .eq('transaction_id', payload.transaction_id)
      .eq('user_id', user.id)
      .single();

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'Already a participant' },
        { status: 400 }
      );
    }

    // Check if user is the creator
    if (transaction.creator_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot join your own transaction' },
        { status: 400 }
      );
    }

    // Check participant count
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
      console.error('Failed to add participant:', participantError);
      return NextResponse.json(
        { error: 'Failed to join transaction' },
        { status: 500 }
      );
    }

    // Update transaction status to 'both_joined'
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ status: 'both_joined' })
      .eq('id', payload.transaction_id);

    if (updateError) {
      console.error('Failed to update transaction status:', updateError);
    }

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
