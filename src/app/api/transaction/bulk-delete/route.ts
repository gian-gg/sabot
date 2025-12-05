import { createClient } from '@/lib/supabase/server';
import { deleteFromBucket } from '@/lib/supabase/storage';
import { NextResponse } from 'next/server';

interface DeleteRequest {
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
  let body: DeleteRequest;
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
    `[Bulk Delete] Found ${transactions.length} transactions to process`
  );
  console.log(
    `[Bulk Delete] Transaction IDs: ${transactions.map((t) => t.id).join(', ')}`
  );
  console.log(`[Bulk Delete] Current user ID: ${user.id}`);

  // 4. Validate ownership and deletable status
  const deletableStatuses = [
    'waiting_for_participant',
    'both_joined',
    'screenshots_uploaded',
  ];
  const invalidTransactions = transactions.filter(
    (t) => t.creator_id !== user.id || !deletableStatuses.includes(t.status)
  );

  console.log(
    `[Bulk Delete] Valid transactions: ${transactions.length - invalidTransactions.length}, Invalid: ${invalidTransactions.length}`
  );
  if (invalidTransactions.length > 0) {
    console.log(`[Bulk Delete] Invalid transactions:`, invalidTransactions);
    return NextResponse.json(
      {
        error:
          'Some transactions cannot be deleted (not owner or invalid status)',
      },
      { status: 403 }
    );
  }

  // 5. Separate by deletion strategy
  const toSoftDelete = transactions.filter(
    (t) => t.status === 'screenshots_uploaded'
  );
  const toHardDelete = transactions.filter(
    (t) => t.status === 'waiting_for_participant' || t.status === 'both_joined'
  );

  console.log(
    `[Bulk Delete] Soft delete queue: ${toSoftDelete.length}, Hard delete queue: ${toHardDelete.length}`
  );

  const results = {
    softDeleted: [] as string[],
    hardDeleted: [] as string[],
    failed: [] as string[],
  };

  // 6. Process soft deletes
  if (toSoftDelete.length > 0) {
    const softUpdateResponse = await supabase
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .in(
        'id',
        toSoftDelete.map((t) => t.id)
      );

    console.log(`[Bulk Delete] Soft delete response:`, {
      error: softUpdateResponse.error,
      count: softUpdateResponse.count,
      status: softUpdateResponse.status,
    });

    if (softUpdateResponse.error) {
      console.error(
        'Error soft-deleting transactions:',
        softUpdateResponse.error
      );
      results.failed.push(...toSoftDelete.map((t) => t.id));
    } else {
      console.log(
        `[Bulk Delete] Successfully soft-deleted ${softUpdateResponse.count} transactions`
      );
      results.softDeleted.push(...toSoftDelete.map((t) => t.id));
    }
  }

  // 7. Process hard deletes with storage cleanup
  for (const transaction of toHardDelete) {
    try {
      // 7a. Get screenshot file paths
      const { data: screenshots, error: screenshotError } = await supabase
        .from('transaction_screenshots')
        .select('file_path')
        .eq('transaction_id', transaction.id);

      if (screenshotError) {
        console.error('Error fetching screenshots:', screenshotError);
      }

      // 7b. Delete screenshot files from storage
      if (screenshots && screenshots.length > 0) {
        for (const screenshot of screenshots) {
          if (screenshot.file_path) {
            try {
              await deleteFromBucket(
                'transaction-screenshots',
                screenshot.file_path
              );
            } catch (storageError) {
              console.error(
                `Failed to delete screenshot from storage: ${screenshot.file_path}`,
                storageError
              );
              // Continue anyway - don't fail the whole operation
            }
          }
        }
      }

      // 7c. Delete transaction (cascades delete related records)
      const deleteResponse = await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id);

      console.log(`[Bulk Delete] Delete response for ${transaction.id}:`, {
        error: deleteResponse.error,
        count: deleteResponse.count,
        status: deleteResponse.status,
      });

      // Status 204 = No Content (successful delete)
      // Status 200 = OK (might be successful or might have affected 0 rows)
      // Check if we got an error OR if status indicates failure
      const isSuccessful =
        !deleteResponse.error &&
        (deleteResponse.status === 204 || deleteResponse.count !== 0);

      if (!isSuccessful) {
        console.error(`Error hard-deleting transaction ${transaction.id}:`, {
          error: deleteResponse.error,
          count: deleteResponse.count,
          status: deleteResponse.status,
        });
        results.failed.push(transaction.id);
      } else {
        console.log(
          `[Bulk Delete] Successfully deleted transaction ${transaction.id}`
        );
        results.hardDeleted.push(transaction.id);
      }
    } catch (error) {
      console.error(`Failed to delete transaction ${transaction.id}:`, error);
      results.failed.push(transaction.id);
    }
  }

  console.log(
    `[Bulk Delete] Final results - Soft deleted: ${results.softDeleted.length}, Hard deleted: ${results.hardDeleted.length}, Failed: ${results.failed.length}`
  );

  return NextResponse.json({
    success: true,
    results,
    summary: {
      softDeleted: results.softDeleted.length,
      hardDeleted: results.hardDeleted.length,
      failed: results.failed.length,
    },
  });
}
