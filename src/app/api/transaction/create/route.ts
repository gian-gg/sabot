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

    console.log('Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      hasError: !!authError,
      error: authError?.message,
    });

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const payload: CreateTransactionPayload = await request.json();

    // Create transaction
    console.log('Creating transaction for user:', user.id);
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        creator_id: user.id,
        creator_name:
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'User',
        creator_email: user.email || '',
        creator_avatar_url:
          user.user_metadata?.avatar_url || user.user_metadata?.picture,
        status: 'waiting_for_participant',
        item_name: payload.item_name,
        item_description: payload.item_description,
        price: payload.price,
        meeting_location: payload.meeting_location,
        meeting_time: payload.meeting_time,
        delivery_address: payload.delivery_address,
        delivery_method: payload.delivery_method,
        online_platform: payload.online_platform,
        online_contact: payload.online_contact,
        online_instructions: payload.online_instructions,
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', {
        code: transactionError.code,
        message: transactionError.message,
        details: transactionError.details,
        hint: transactionError.hint,
      });
      return NextResponse.json(
        { error: transactionError.message || 'Failed to create transaction' },
        { status: 500 }
      );
    }

    console.log('Transaction created successfully:', transaction.id);

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
      invite_url: `${process.env.NEXT_PUBLIC_BASE_URL}/transaction/accept?id=${transaction.id}`,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
