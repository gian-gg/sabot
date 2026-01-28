'use server';

import { createClient } from '../server';
import { uploadToBucket } from '../storage';
import type { PublicUserProfile, ProfileTransaction } from '@/types/profile';
import type { SupabaseClient } from '@supabase/supabase-js';

type DatabaseTransaction = {
  id: string;
  creator_id: string;
  creator_name: string | null;
  creator_email: string | null;
  creator_avatar_url: string | null;
  item_name: string | null;
  price: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

const ACTIVE_STATUSES = [
  'active',
  'pending',
  'both_joined',
  'screenshots_uploaded',
  'waiting_for_participant',
] as const;

const DEFAULT_JOIN_DATE = '2023-01-01';
const MAX_TRANSACTIONS = 50;
const MAX_RECENT_TRANSACTIONS = 20;

export async function getUserProfile(
  userId: string
): Promise<PublicUserProfile | null> {
  try {
    const supabase = await createClient();

    const [verificationResult, creatorTxResult, participantDataResult] =
      await Promise.all([
        supabase
          .from('user_data')
          .select('verification_status')
          .eq('id', userId)
          .single(),
        supabase
          .from('transactions')
          .select('*, creator_name, creator_email, creator_avatar_url')
          .eq('creator_id', userId)
          .order('created_at', { ascending: false })
          .limit(MAX_TRANSACTIONS),
        supabase
          .from('transaction_participants')
          .select('transaction_id')
          .eq('user_id', userId),
      ]);

    const creatorTransactions = creatorTxResult.data || [];
    const participantTxIds =
      participantDataResult.data?.map((p) => p.transaction_id) || [];

    const userExists =
      verificationResult.data !== null ||
      creatorTransactions.length > 0 ||
      participantTxIds.length > 0;

    if (!userExists) return null;

    const isVerified =
      verificationResult.data?.verification_status === 'verified';
    const userInfo = creatorTransactions[0] || {};
    const baseProfile = {
      id: userId,
      name: userInfo.creator_name || `User ${userId.substring(0, 8)}`,
      email: userInfo.creator_email,
      avatar: userInfo.creator_avatar_url,
      isVerified,
    };

    if (!isVerified) {
      return {
        ...baseProfile,
        stats: createEmptyStats(),
        recentTransactions: [],
        memberSince: 'Recently',
      };
    }

    const participantTransactions =
      participantTxIds.length > 0
        ? (
            await supabase
              .from('transactions')
              .select('*, creator_name, creator_email, creator_avatar_url')
              .in('id', participantTxIds)
              .order('created_at', { ascending: false })
              .limit(MAX_TRANSACTIONS)
          ).data || []
        : [];

    const allTransactions = deduplicateAndSortTransactions([
      ...creatorTransactions,
      ...participantTransactions,
    ]);

    const transactions = await buildTransactionList(
      supabase,
      allTransactions,
      userId
    );

    const stats = calculateStats(transactions, allTransactions);
    const memberSince = formatMemberSince(allTransactions);

    return {
      ...baseProfile,
      stats,
      recentTransactions: transactions.slice(0, MAX_RECENT_TRANSACTIONS),
      memberSince,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

function createEmptyStats() {
  return {
    totalTransactions: 0,
    completedTransactions: 0,
    activeTransactions: 0,
    trustScore: 0,
    joinDate: new Date(DEFAULT_JOIN_DATE).toISOString(),
    completionRate: 0,
  };
}

function deduplicateAndSortTransactions(
  transactions: DatabaseTransaction[]
): DatabaseTransaction[] {
  const uniqueMap = new Map<string, DatabaseTransaction>();
  transactions.forEach((tx) => {
    if (!uniqueMap.has(tx.id)) uniqueMap.set(tx.id, tx);
  });

  return Array.from(uniqueMap.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

async function buildTransactionList(
  supabase: SupabaseClient,
  transactions: DatabaseTransaction[],
  userId: string
): Promise<ProfileTransaction[]> {
  return Promise.all(
    transactions.map(async (tx) => {
      const isCreator = tx.creator_id === userId;
      const counterpartyName = await getCounterpartyName(
        supabase,
        tx,
        isCreator
      );

      return {
        id: tx.id,
        type: determineTransactionType(tx.item_name),
        status: tx.status as ProfileTransaction['status'],
        title: tx.item_name || 'Untitled Transaction',
        amount: tx.price ? parseFloat(String(tx.price)) : undefined,
        currency: tx.price ? '$' : undefined,
        counterpartyName,
        completedAt: tx.status === 'completed' ? tx.updated_at : undefined,
        createdAt: tx.created_at,
      };
    })
  );
}

async function getCounterpartyName(
  supabase: SupabaseClient,
  tx: DatabaseTransaction,
  isCreator: boolean
): Promise<string> {
  if (isCreator) {
    const { data } = await supabase
      .from('transaction_participants')
      .select('user_id')
      .eq('transaction_id', tx.id)
      .eq('role', 'invitee')
      .limit(1);

    return data?.[0]
      ? `User ${data[0].user_id.substring(0, 8)}`
      : 'Anonymous User';
  }

  return `User ${tx.creator_id.substring(0, 8)}`;
}

function calculateStats(
  transactions: ProfileTransaction[],
  allTransactions: DatabaseTransaction[]
) {
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(
    (tx) => tx.status === 'completed'
  ).length;
  const activeTransactions = transactions.filter((tx) =>
    ACTIVE_STATUSES.includes(tx.status as (typeof ACTIVE_STATUSES)[number])
  ).length;

  const completionRate =
    totalTransactions > 0
      ? Math.round((completedTransactions / totalTransactions) * 100)
      : 0;

  const trustScore = Math.min(
    100,
    Math.round(completionRate * 0.7 + Math.min(totalTransactions * 2, 30))
  );

  const joinDate =
    allTransactions.length > 0
      ? new Date(allTransactions[allTransactions.length - 1].created_at)
      : new Date(DEFAULT_JOIN_DATE);

  return {
    totalTransactions,
    completedTransactions,
    activeTransactions,
    trustScore,
    joinDate: joinDate.toISOString(),
    completionRate,
  };
}

function formatMemberSince(transactions: DatabaseTransaction[]): string {
  if (transactions.length === 0) return 'Recently';

  const joinDate = new Date(transactions[transactions.length - 1].created_at);
  return joinDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function determineTransactionType(
  itemName?: string | null
): ProfileTransaction['type'] {
  if (!itemName) return 'home-goods';

  const name = itemName.toLowerCase();
  if (name.includes('electronics')) return 'electronics';
  if (name.includes('service')) return 'services';
  return 'home-goods';
}

/**
 * Updates a user's display name
 * @param userId - The user's ID
 * @param displayName - The new display name
 * @returns Success status
 */
export async function updateUserDisplayName(
  userId: string,
  displayName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify the authenticated user matches the userId
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return {
        success: false,
        error: 'Unauthorized: You can only update your own profile',
      };
    }

    // Update the user_metadata in Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      data: { full_name: displayName },
    });

    if (authError) {
      console.error('Failed to update user display name:', authError);
      return { success: false, error: authError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error updating display name:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Uploads a user's profile picture to Supabase Storage and updates their profile
 * @param userId - The user's ID
 * @param file - The image file to upload (as base64 data URL)
 * @returns Success status and the new image URL
 */
export async function uploadProfilePicture(
  userId: string,
  file: string // base64 data URL from cropper
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify the authenticated user matches the userId
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return {
        success: false,
        error: 'Unauthorized: You can only update your own profile',
      };
    }

    // Convert base64 data URL to Blob
    const response = await fetch(file);
    const blob = await response.blob();

    // Generate a unique filename
    const fileName = `profile-${userId}.jpg`;

    // Upload to Supabase Storage
    const { publicUrl } = await uploadToBucket({
      bucket: 'avatars',
      content: blob,
      fileName,
      pathPrefix: userId,
      contentType: 'image/jpeg',
      upsert: true, // Allow overwriting existing profile pictures
    });

    if (!publicUrl) {
      return { success: false, error: 'Failed to get public URL' };
    }

    // Update the user_metadata with the new image URL
    const { error: authError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (authError) {
      console.error('Failed to update user profile picture:', authError);
      return { success: false, error: authError.message };
    }

    return { success: true, imageUrl: publicUrl };
  } catch (error) {
    console.error('Unexpected error uploading profile picture:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
