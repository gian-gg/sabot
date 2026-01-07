'use server';

import { createClient } from '../server';
import type { AgreementWithParticipants } from '@/types/agreement';

export async function getAgreementsByUserID(
  userId: string
): Promise<AgreementWithParticipants[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('agreements')
    .select(
      `
      *,
      participants:agreement_participants (*)
    `
    )
    .eq('creator_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching agreements:', error.message);
    return [];
  }

  return (data as AgreementWithParticipants[]) || [];
}

export interface AgreementLimitsStatus {
  waiting: {
    current: number;
    max: number;
    canCreate: boolean;
  };
  inProgress: {
    current: number;
    max: number;
    canCreate: boolean;
  };
  canCreateAgreement: boolean;
}

/**
 * Get agreement limits status for a user
 * Limits: 2 waiting_for_participant, 3 in-progress, unlimited finalized
 */
export async function getAgreementLimitsStatus(
  userId: string
): Promise<AgreementLimitsStatus> {
  const supabase = await createClient();

  // Count waiting agreements
  const { data: waitingData, error: waitingError } = await supabase
    .from('agreements')
    .select('id')
    .eq('creator_id', userId)
    .eq('status', 'waiting_for_participant');

  // Count in-progress agreements
  const { data: inProgressData, error: inProgressError } = await supabase
    .from('agreements')
    .select('id')
    .eq('creator_id', userId)
    .eq('status', 'in-progress');

  const waitingCount = waitingError ? 0 : waitingData?.length || 0;
  const inProgressCount = inProgressError ? 0 : inProgressData?.length || 0;

  const MAX_WAITING = 2;
  const MAX_IN_PROGRESS = 3;

  return {
    waiting: {
      current: waitingCount,
      max: MAX_WAITING,
      canCreate: waitingCount < MAX_WAITING,
    },
    inProgress: {
      current: inProgressCount,
      max: MAX_IN_PROGRESS,
      canCreate: inProgressCount < MAX_IN_PROGRESS,
    },
    canCreateAgreement:
      waitingCount < MAX_WAITING && inProgressCount < MAX_IN_PROGRESS,
  };
}
