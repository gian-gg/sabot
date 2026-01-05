import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validatePrice } from '@/types/transaction';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    console.log('🔍 GET /api/transaction/[id] - Request received:', { id });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', {
      userId: user.id,
      email: user.email,
    });

    // Get transaction with creator information
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (transactionError) {
      console.error('❌ Transaction query error:', transactionError);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (!transaction) {
      console.error('❌ Transaction not found in database');
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    console.log('📦 Transaction data:', {
      id: transaction.id,
      creator_id: transaction.creator_id,
      creator_name: transaction.creator_name,
      creator_email: transaction.creator_email,
      creator_avatar: transaction.creator_avatar_url,
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('❌ Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const formData = await request.json();

    console.log('Transaction update request:', {
      transactionId: id,
      userId: user.id,
      formData: {
        item_name: formData.item_name,
        transaction_type: formData.transaction_type,
        price: formData.price,
      },
    });

    // First, check if the transaction exists and user has permission
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('id, creator_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingTransaction) {
      console.error('Transaction not found:', fetchError);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if user is either the creator or a participant
    const { data: participant, error: participantError } = await supabase
      .from('transaction_participants')
      .select('user_id, role')
      .eq('transaction_id', id)
      .eq('user_id', user.id)
      .single();

    const isCreator = existingTransaction.creator_id === user.id;
    const isParticipant = participant && !participantError;

    if (!isCreator && !isParticipant) {
      console.error('User not authorized to update this transaction');
      return NextResponse.json(
        { error: 'Not authorized to update this transaction' },
        { status: 403 }
      );
    }

    console.log('User authorized to update transaction:', {
      isCreator,
      isParticipant,
      userId: user.id,
      creatorId: existingTransaction.creator_id,
    });

    // Validate price if provided
    let validatedPrice: number | null = null;
    if (
      formData.price !== undefined &&
      formData.price !== null &&
      formData.price !== ''
    ) {
      try {
        validatedPrice = validatePrice(formData.price);
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

    // Update transaction with form data
    const { data: transaction, error: updateError } = await supabase
      .from('transactions')
      .update({
        item_name: formData.item_name,
        item_description: formData.item_description,
        price: validatedPrice,
        transaction_type: formData.transaction_type,
        meeting_location: formData.meeting_location,
        meeting_time: formData.meeting_time
          ? new Date(formData.meeting_time).toISOString()
          : null,
        delivery_address: formData.delivery_address,
        delivery_method: formData.delivery_method,
        online_platform: formData.online_platform,
        online_contact: formData.online_contact,
        online_instructions: formData.online_instructions,
        category: formData.category,
        condition: formData.condition,
        quantity: parseInt(formData.quantity) || 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError || !transaction) {
      console.error('Transaction update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      );
    }

    console.log('✅ Transaction updated successfully:', transaction.id);

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
