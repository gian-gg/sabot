'use server';

import { createClient } from '../server';
import type { UserVerificationData, VerificationStatus } from '@/types/user';

export async function getUserVerificationData(
  userId: string
): Promise<UserVerificationData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_data')
    .select('verification_status, role')
    .eq('id', userId)
    .single();

  // if there's an error or no data, we assume the user is not verified
  if (error || !data) {
    return {
      verification_status: 'not-started',
      role: 'user',
    };
  }

  return {
    verification_status: data.verification_status,
    role: data.role,
  };
}

export async function updateUserVerificationStatus(
  userId: string,
  status: VerificationStatus
): Promise<boolean> {
  const supabase = await createClient();

  // Try to update first
  const { error: updateError } = await supabase
    .from('user_data')
    .update({ verification_status: status })
    .eq('id', userId);

  // If update fails because row doesn't exist, create it
  if (updateError) {
    // Check if error is due to no rows matched
    const { error: insertError } = await supabase.from('user_data').insert({
      id: userId,
      verification_status: status,
      role: 'user', // default role
    });

    if (insertError) {
      console.error('Error creating user verification status:', insertError);
      return false;
    }
  }

  return true;
}
