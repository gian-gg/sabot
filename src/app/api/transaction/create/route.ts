import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateTransactionPayload } from '@/types/transaction';

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
    const payload: CreateTransactionPayload = await request.json();

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        creator_id: user.id,
        status: 'waiting_for_participant',
        item_name: payload.item_name,
        item_description: payload.item_description,
        price: payload.price,
        meeting_location: payload.meeting_location,
        meeting_time: payload.meeting_time,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    // Add creator as participant
    const { error: participantError } = await supabase
      .from('transaction_participants')
      .insert({
        transaction_id: transaction.id,
        user_id: user.id,
        role: 'creator',
      });

    if (participantError) {
      console.error('Participant creation error:', participantError);
      // Rollback transaction
      await supabase.from('transactions').delete().eq('id', transaction.id);
      return NextResponse.json(
        { error: 'Failed to add participant' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transaction,
      invite_url: `${process.env.NEXT_PUBLIC_BASE_URL}/transaction/invite?id=${transaction.id}`,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
