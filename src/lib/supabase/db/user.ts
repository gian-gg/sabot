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

  // Try to update first, and ask for the data back
  const { data, error: updateError } = await supabase
    .from('user_data')
    .update({ verification_status: status })
    .eq('id', userId)
    .select('id'); // <-- Chain .select() here

  console.log(userId, updateError);

  if (updateError) {
    // This catches *real* errors, like RLS violations or network issues
    console.error('Error updating user verification status:', updateError);
    return false;
  }

  // If updateError is null, check if any data was returned.
  // No data means no row was found to update.
  if (!data || data.length === 0) {
    // Row doesn't exist, so create it
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

  // If we get here, either the update or the insert was successful
  return true;
}

// Batch fetch verification status for many users
export async function getUsersVerificationMap(
  userIds: string[]
): Promise<Record<string, VerificationStatus>> {
  const unique = Array.from(new Set(userIds)).filter(Boolean);
  if (unique.length === 0) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_data')
    .select('id, verification_status')
    .in('id', unique);

  if (error || !data) {
    // Fallback: mark unknowns as not-started
    return Object.fromEntries(
      unique.map((id) => [id, 'not-started' as VerificationStatus])
    );
  }

  type UserDataRow = {
    id: string;
    verification_status: VerificationStatus | null;
  };
  const rows = data as UserDataRow[];
  const map: Record<string, VerificationStatus> = Object.fromEntries(
    rows.map(({ id, verification_status }) => [
      id,
      (verification_status ?? 'not-started') as VerificationStatus,
    ])
  );
  // Ensure every id has an entry
  for (const id of unique) {
    if (!map[id]) map[id] = 'not-started';
  }
  return map;
}

export async function getEncryptedKey(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_wallet')
    .select('encrypt_private_key')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return String(data.encrypt_private_key);
}

export async function getPublicAddress(userId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_wallet')
    .select('address')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return String(data.address);
}

export async function postNewUserWallet(
  userId: string,
  publicAddress: string,
  encryptedKey: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_wallet')
    .insert([
      { id: userId, address: publicAddress, encrypt_private_key: encryptedKey },
    ]);

  if (error) return false;

  return true;
}
