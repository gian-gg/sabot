'use server';

import { createClient } from '../server';
import { createAdminClient } from '../admin';
import type { UserVerificationData, VerificationStatus } from '@/types/user';
import type { UserRole, DBTransaction } from '@/types/transaction';

export async function getUserEmailFromID(
  userId: string
): Promise<{ email: string; name: string } | null> {
  try {
    const supabaseAdmin = createAdminClient();

    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !data.user) {
      console.error(`❌ Error fetching user ${userId}:`, error);
      return null;
    }

    return {
      email: data.user.email || '',
      name: data.user.user_metadata?.name || 'User',
    };
  } catch (error) {
    console.error(`❌ Error in getUserEmailFromID:`, error);
    return null;
  }
}

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

  const { error } = await supabase.from('user_data').upsert(
    {
      id: userId,
      verification_status: status,
      role: 'user',
    },
    { onConflict: 'id' }
  );

  if (error) {
    console.error(
      `❌ Supabase Upsert Error for user ${userId}:`,
      error.message
    );
    return false;
  }

  console.log(`✅ user_data ${status} for ${userId}`);
  return true;
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

export async function getTransactionDetails(
  transactionId: string
): Promise<DBTransaction[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId);

    if (error) {
      console.error(
        'getTransactionDetails: Failed to fetch transaction details:',
        error
      );
      return [];
    }

    return data;
  } catch (error) {
    console.error('getTransactionDetails: Unexpected error:', error);
    return [];
  }
}

export async function postHashTransaction(
  hash: string,
  transaction_id: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('transactions')
      .update([{ hash }])
      .eq('id', transaction_id);

    if (error) {
      console.error(
        'postHashTransaction: Failed to insert hash transaction:',
        error
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      'postHashTransaction: Failed to post hash transaction:',
      error
    );
    return false;
  }
}

export async function getAllUserIds(
  transaction_id: string
): Promise<UserRole[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('transaction_participants')
      .select('user_id, role')
      .eq('transaction_id', transaction_id);

    if (error || !data) {
      console.error('getAllUserIds: Failed to fetch user IDs:', error);
      return [];
    }

    // 💡 EDITED LINE: Map the returned rows to the desired UserRole object structure
    return data.map((row: { user_id: string; role: string }) => ({
      user_id: row.user_id,
      role: row.role,
    }));
  } catch (error) {
    console.error('getAllUserIds: Unexpected error:', error);
    return [];
  }
}

export async function getGasFeeWarningSeen(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_data')
    .select('has_seen_gas_fee_warning')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false; // Default to false if no data or error
  }

  return data.has_seen_gas_fee_warning ?? false;
}

export async function setGasFeeWarningSeen(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from('user_data').upsert({
    id: userId,
    has_seen_gas_fee_warning: true,
  });

  if (error) {
    console.error('Error upserting gas fee warning status:', error);
    return false;
  }

  return true;
}
