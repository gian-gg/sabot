'use server';

import { createClient } from '../server';
import type { TransactionDetails } from '@/types/transaction';

export async function getTransactionDetailsByUserID(
  userId: string
): Promise<TransactionDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('transactions')
    .select(
      `
      *,
      transaction_participants (*)
    `
    )
    .eq('creator_id', userId);

  if (error) {
    console.error('Error fetching transactions with details:', error.message);
    return [];
  }

  return (data as TransactionDetails[]) || [];
}
