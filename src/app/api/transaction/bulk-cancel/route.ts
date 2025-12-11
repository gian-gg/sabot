import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface CancelRequest {
  transactionIds: string[];
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse request body
  let body: CancelRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { transactionIds } = body;

  if (!transactionIds || transactionIds.length === 0) {
    return NextResponse.json(
      { error: 'No transactions specified' },
      { status: 400 }
    );
  }

  // 3. Fetch all transactions and verify ownership + status
  const { data: transactions, error: fetchError } = await supabase
    .from('transactions')
    .select('id, creator_id, status')
    .in('id', transactionIds);

  if (fetchError || !transactions) {
    console.error('Error fetching transactions:', fetchError);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }

  console.log(
    `[Bulk Cancel] Found ${transactions.length} transactions to process`
  );
  console.log(
    `[Bulk Cancel] Transaction IDs: ${transactions.map((t) => t.id).join(', ')}`
  );
  console.log(`[Bulk Cancel] Current user ID: ${user.id}`);

  // 4. Validate ownership and cancellable status (only 'active' transactions)
  const cancellableStatuses = ['active'];
  const invalidTransactions = transactions.filter(
    (t) => t.creator_id !== user.id || !cancellableStatuses.includes(t.status)
  );

  console.log(
    `[Bulk Cancel] Valid transactions: ${transactions.length - invalidTransactions.length}, Invalid: ${invalidTransactions.length}`
  );
  if (invalidTransactions.length > 0) {
    console.log(`[Bulk Cancel] Invalid transactions:`, invalidTransactions);
    return NextResponse.json(
      {
        error:
          'Some transactions cannot be cancelled (not owner or invalid status)',
      },
      { status: 403 }
    );
  }

  const results = {
    cancelled: [] as string[],
    failed: [] as string[],
  };

  // 5. Process cancellations
  for (const transaction of transactions) {
    try {
      // Update transaction status to 'cancelled'
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error(
          `Error cancelling transaction ${transaction.id}:`,
          updateError
        );
        results.failed.push(transaction.id);
        continue;
      }

      // Broadcast cancellation event to participants
      const channel = supabase.channel(`transaction:${transaction.id}`);
      await channel.send({
        type: 'broadcast',
        event: 'transaction_cancelled',
        payload: {
          transaction_id: transaction.id,
          cancelled_by: user.id,
          cancelled_at: new Date().toISOString(),
        },
      });

      console.log(
        `[Bulk Cancel] Successfully cancelled transaction ${transaction.id.slice(0, 8)}`
      );
      results.cancelled.push(transaction.id);
    } catch (error) {
      console.error(`Failed to cancel transaction ${transaction.id}:`, error);
      results.failed.push(transaction.id);
    }
  }

  console.log(
    `[Bulk Cancel] Final results - Cancelled: ${results.cancelled.length}, Failed: ${results.failed.length}`
  );

  return NextResponse.json({
    success: true,
    results,
    summary: {
      cancelled: results.cancelled.length,
      failed: results.failed.length,
    },
  });
}
