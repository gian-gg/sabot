import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateTransactionPayload, validatePrice } from '@/types/transaction';

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

    // Check transaction count guardrails
    const { data: pendingTransactions, error: pendingError } = await supabase
      .from('transactions')
      .select('id')
      .eq('creator_id', user.id)
      .in('status', [
        'waiting_for_participant',
        'both_joined',
        'screenshots_uploaded',
      ])
      .is('deleted_at', null);

    if (pendingError) {
      console.error('Error counting pending transactions:', pendingError);
      return NextResponse.json(
        { error: 'Failed to check transaction limits' },
        { status: 500 }
      );
    }

    const pendingCount = pendingTransactions?.length || 0;
    const MAX_PENDING = 5;

    if (pendingCount >= MAX_PENDING) {
      console.log('[Create] Pending transaction limit exceeded:', {
        userId: user.id,
        pendingCount,
        MAX_PENDING,
      });
      return NextResponse.json(
        {
          error: `You have reached the maximum limit of ${MAX_PENDING} pending transactions. Please complete or delete some transactions before creating new ones.`,
          code: 'MAX_PENDING_EXCEEDED',
          currentCount: pendingCount,
          maxLimit: MAX_PENDING,
        },
        { status: 409 }
      );
    }

    const { data: activeTransactions, error: activeError } = await supabase
      .from('transactions')
      .select('id')
      .eq('creator_id', user.id)
      .in('status', ['active', 'pending', 'reported', 'disputed'])
      .is('deleted_at', null);

    if (activeError) {
      console.error('Error counting active transactions:', activeError);
      return NextResponse.json(
        { error: 'Failed to check transaction limits' },
        { status: 500 }
      );
    }

    const activeCount = activeTransactions?.length || 0;
    const MAX_ACTIVE = 3;

    if (activeCount >= MAX_ACTIVE) {
      console.log('[Create] Active transaction limit exceeded:', {
        userId: user.id,
        activeCount,
        MAX_ACTIVE,
      });
      return NextResponse.json(
        {
          error: `You have reached the maximum limit of ${MAX_ACTIVE} active transactions. Please complete or cancel some transactions before creating new ones.`,
          code: 'MAX_ACTIVE_EXCEEDED',
          currentCount: activeCount,
          maxLimit: MAX_ACTIVE,
        },
        { status: 409 }
      );
    }

    console.log('Transaction limits check:', {
      userId: user.id,
      pendingCount,
      activeCount,
      limitsOk: true,
    });

    // Validate price if provided
    let validatedPrice: number | undefined;
    if (payload.price !== undefined && payload.price !== null) {
      try {
        validatedPrice = validatePrice(payload.price);
      } catch (error) {
        console.error('Price validation error:', error);
        return NextResponse.json(
          {
            error: error instanceof Error ? error.message : 'Invalid price',
            code: 'INVALID_PRICE',
          },
          { status: 400 }
        );
      }
    }

    // Get creator info from user metadata
    const creatorName =
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'User';
    const creatorEmail = user.email || '';
    const creatorAvatarUrl =
      user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    console.log('Create - Creator data to store:', {
      creatorName,
      creatorEmail,
      creatorAvatarUrl,
    });

    // Create transaction
    console.log('Creating transaction for user:', user.id, {
      name: creatorName,
      email: creatorEmail,
    });
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        creator_id: user.id,
        creator_name: creatorName,
        creator_email: creatorEmail,
        creator_avatar_url: creatorAvatarUrl,
        status: 'waiting_for_participant',
        item_name: payload.item_name,
        item_description: payload.item_description,
        price: validatedPrice,
        transaction_type: payload.transaction_type,
        meeting_location: payload.meeting_location,
        meeting_time: payload.meeting_time,
        delivery_address: payload.delivery_address,
        delivery_method: payload.delivery_method,
        online_platform: payload.online_platform,
        online_contact: payload.online_contact,
        online_instructions: payload.online_instructions,
        category: payload.category,
        condition: payload.condition,
        quantity: payload.quantity || 1,
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

    // Add creator as participant with profile data
    const { error: participantError } = await supabase
      .from('transaction_participants')
      .insert({
        transaction_id: transaction.id,
        user_id: user.id,
        role: 'creator',
        participant_name: creatorName,
        participant_email: creatorEmail,
        participant_avatar_url: creatorAvatarUrl,
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
