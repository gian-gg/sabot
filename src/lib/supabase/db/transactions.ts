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
