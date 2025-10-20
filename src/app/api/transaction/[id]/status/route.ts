import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TransactionStatusResponse } from '@/types/transaction';

export async function GET(
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

    // Get transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Get participants
    const { data: participants, error: participantsError } = await supabase
      .from('transaction_participants')
      .select('*')
      .eq('transaction_id', id);

    if (participantsError) {
      console.error('Failed to fetch participants:', participantsError);
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    // Check if current user is a participant
    const currentUserParticipant = participants?.find(
      (p) => p.user_id === user.id
    );

    if (!currentUserParticipant) {
      return NextResponse.json(
        { error: 'Not a participant of this transaction' },
        { status: 403 }
      );
    }

    // Determine if ready for next step
    const participantCount = participants?.length || 0;
    const bothJoined = participantCount === 2;
    const bothUploaded =
      bothJoined && participants?.every((p) => p.screenshot_uploaded === true);

    let is_ready_for_next_step = false;

    // Ready to move to upload screen if both users have joined
    if (bothJoined && transaction.status === 'both_joined' && !bothUploaded) {
      is_ready_for_next_step = true;
    }
    // Ready to move to transaction details if both uploaded
    else if (transaction.status === 'screenshots_uploaded' && bothUploaded) {
      is_ready_for_next_step = true;
    }

    console.log(`Status API [${id}]:`, {
      status: transaction.status,
      participantCount,
      bothJoined,
      bothUploaded,
      is_ready_for_next_step,
      user: user.id.slice(0, 8),
    });

    const response: TransactionStatusResponse = {
      transaction,
      participants: participants || [],
      current_user_role: currentUserParticipant.role,
      is_ready_for_next_step,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
