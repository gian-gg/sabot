'use server';

import { createClient } from '../server';
import type { VerificationStatus } from '@/types/user';

export async function getUserVerificationStatus(
  userId: string
): Promise<VerificationStatus> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_data')
    .select('verification_status')
    .eq('id', userId)
    .single();

  // if there's an error or no data, we assume the user is not verified
  if (error || !data) {
    return 'not-started';
  }

  return data.verification_status as VerificationStatus;
}
