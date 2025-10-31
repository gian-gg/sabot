'use server';

import { createClient } from '../server';
import type { TransactionDetails } from '@/types/transaction';

export async function getTransactionDetailsByUserID(
  userId: string
): Promise<TransactionDetails[]> {
  const supabase = await createClient();

  console.log('ASDJKHASD' + userId);
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data as TransactionDetails[];
}
