'use server';

import { createClient } from '../server';
import type { TransactionDetails } from '@/types/transaction';

export async function getTransactionDetailsByUserID(
  userId: string,
  includeDeleted: boolean = false
): Promise<TransactionDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from('transactions')
    .select(
      `
      *,
      transaction_participants (*)
    `
    )
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  // Filter out soft-deleted unless explicitly requested
  if (!includeDeleted) {
    query = query.is('deleted_at', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions with details:', error.message);
    return [];
  }

  return (data as TransactionDetails[]) || [];
}
