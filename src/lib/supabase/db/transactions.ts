'use server';

import { createClient } from '../server';
import type {
  TransactionDetails,
  TransactionQueryParams,
  PaginatedTransactionResponse,
} from '@/types/transaction';
import { revalidatePath } from 'next/cache';

export async function getTransactionDetailsPaginated(
  userId: string,
  params: TransactionQueryParams
): Promise<PaginatedTransactionResponse> {
  const supabase = await createClient();
  const {
    page = 1,
    pageSize = 10,
    search = '',
    status = 'all',
    type = 'all',
    dateRange = 'all',
    minAmount,
    maxAmount,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Step 1: Get all transaction IDs where the user is a participant
  const { data: participationData, error: participationError } = await supabase
    .from('transaction_participants')
    .select('transaction_id')
    .eq('user_id', userId);

  if (participationError) {
    console.error('Error fetching participation:', participationError);
    return { transactions: [], totalCount: 0, page, pageSize };
  }

  const transactionIds = participationData.map((p) => p.transaction_id);

  if (transactionIds.length === 0) {
    return { transactions: [], totalCount: 0, page, pageSize };
  }

  // Base query
  let query = supabase
    .from('transactions')
    .select(
      `
      *,
      transaction_participants (*),
      transaction_comments!transaction_comments_transaction_id_fkey (count)
    `,
      { count: 'exact' }
    )
    .in('id', transactionIds)
    .is('deleted_at', null);

  // Apply filters
  if (status !== 'all') {
    if (status === 'pending') {
      // Pending includes several statuses
      query = query.in('status', [
        'pending',
        'waiting_for_participant',
        'both_joined',
        'screenshots_uploaded',
      ]);
    } else {
      query = query.eq('status', status);
    }
  }

  if (type !== 'all') {
    query = query.eq('transaction_type', type);
  }

  if (dateRange !== 'all') {
    const now = new Date();
    let startDate: Date | null = null;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
    }

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
  }

  if (minAmount !== undefined) {
    query = query.gte('price', minAmount);
  }

  if (maxAmount !== undefined) {
    query = query.lte('price', maxAmount);
  }

  // Apply search
  if (search) {
    // Search in item_name, transaction ID, or participant names
    // Note: Searching joined tables (participants) with complex OR logic is tricky in Supabase
    // Simplest approach for now is basic text search on transaction fields
    // For participant name search, we might need a separate RPC or more complex query structure
    // allowing simple item name or ID match for now to keep it efficient
    const searchTerm = `%${search}%`;
    query = query.or(`item_name.ilike.${searchTerm},id.ilike.${searchTerm}`);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching transactions:', error.message);
    return { transactions: [], totalCount: 0, page, pageSize };
  }

  const transactions = (data as any[]).map((t) => ({
    ...t,
    comment_count: t.transaction_comments ? t.transaction_comments[0].count : 0,
  })) as TransactionDetails[];

  return {
    transactions,
    totalCount: count || 0,
    page,
    pageSize,
  };
}

export async function getTransactionDetailsByUserID(
  userId: string,
  includeDeleted: boolean = false
): Promise<TransactionDetails[]> {
  // Keeping this for backward compatibility
  // This function fetches all transactions for a user without pagination

  const supabase = await createClient();

  // Get participation IDs first
  const { data: participationData } = await supabase
    .from('transaction_participants')
    .select('transaction_id')
    .eq('user_id', userId);

  const transactionIds = participationData?.map((p) => p.transaction_id) || [];

  if (transactionIds.length === 0) {
    return [];
  }

  let query = supabase
    .from('transactions')
    .select(
      `
      *,
      transaction_participants (*)
    `
    )
    .in('id', transactionIds)
    .order('created_at', { ascending: false });

  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions with details:', error.message);
    return [];
  }

  const transactions = (data as TransactionDetails[]) || [];

  for (const transaction of transactions) {
    const { count } = await supabase
      .from('transaction_comments')
      .select('id', { count: 'exact' })
      .eq('transaction_id', transaction.id);

    transaction.comment_count = count || 0;
  }

  return transactions;
}

export interface TransactionLimitsStatus {
  pending: {
    current: number;
    max: number;
    canCreate: boolean;
  };
  active: {
    current: number;
    max: number;
    canCreate: boolean;
  };
  canCreateTransaction: boolean;
}

/**
 * Get transaction limits status for a user
 * Returns counts of pending and active transactions
 * Pending: waiting_for_participant, both_joined, screenshots_uploaded
 * Active: active, pending, reported, disputed
 */
export async function getTransactionLimitsStatus(
  userId: string
): Promise<TransactionLimitsStatus> {
  const supabase = await createClient();

  // Count pending transactions
  const { data: pendingData, error: pendingError } = await supabase
    .from('transactions')
    .select('id')
    .eq('creator_id', userId)
    .in('status', [
      'waiting_for_participant',
      'both_joined',
      'screenshots_uploaded',
    ])
    .is('deleted_at', null);

  // Count active transactions
  const { data: activeData, error: activeError } = await supabase
    .from('transactions')
    .select('id')
    .eq('creator_id', userId)
    .in('status', ['active', 'pending', 'reported', 'disputed'])
    .is('deleted_at', null);

  const pendingCount = pendingError ? 0 : pendingData?.length || 0;
  const activeCount = activeError ? 0 : activeData?.length || 0;

  const MAX_PENDING = 5;
  const MAX_ACTIVE = 3;

  return {
    pending: {
      current: pendingCount,
      max: MAX_PENDING,
      canCreate: pendingCount < MAX_PENDING,
    },
    active: {
      current: activeCount,
      max: MAX_ACTIVE,
      canCreate: activeCount < MAX_ACTIVE,
    },
    canCreateTransaction:
      pendingCount < MAX_PENDING && activeCount < MAX_ACTIVE,
  };
}

export async function deleteTransaction(
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Fetch transaction to verify ownership and status
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('id, creator_id, status')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      return { success: false, error: 'Transaction not found' };
    }

    if (transaction.creator_id !== user.id) {
      return {
        success: false,
        error: 'You are not authorized to delete this transaction',
      };
    }

    const deletableStatuses = [
      'waiting_for_participant',
      'both_joined',
      'screenshots_uploaded',
      'pending',
    ];

    if (!deletableStatuses.includes(transaction.status)) {
      return {
        success: false,
        error: 'Transaction cannot be deleted in its current status',
      };
    }

    // Determine deletion strategy
    if (transaction.status === 'screenshots_uploaded') {
      // Soft delete
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', transactionId);

      if (updateError) throw updateError;
    } else {
      // Hard delete
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (deleteError) throw deleteError;
    }

    revalidatePath('/user');
    revalidatePath(`/transaction/${transactionId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return {
      success: false,
      error: 'Failed to delete transaction',
    };
  }
}

export async function cancelTransaction(
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Fetch transaction
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('id, creator_id, status')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      return { success: false, error: 'Transaction not found' };
    }

    if (transaction.creator_id !== user.id) {
      return {
        success: false,
        error: 'You are not authorized to cancel this transaction',
      };
    }

    if (transaction.status !== 'active') {
      return {
        success: false,
        error: 'Only active transactions can be cancelled',
      };
    }

    // Update status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    if (updateError) throw updateError;

    // Broadcast event (best effort)
    const channel = supabase.channel(`transaction:${transactionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'transaction_cancelled',
      payload: {
        transaction_id: transactionId,
        cancelled_by: user.id,
        cancelled_at: new Date().toISOString(),
      },
    });

    revalidatePath('/user');
    revalidatePath(`/transaction/${transactionId}`);
    return { success: true };
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    return {
      success: false,
      error: 'Failed to cancel transaction',
    };
  }
}
