'use server';

import { createClient } from '../server';
import type { PublicUserProfile, ProfileTransaction } from '@/types/profile';

/**
 * Fetch user profile data including stats and transaction history
 */
export async function getUserProfile(
  userId: string
): Promise<PublicUserProfile | null> {
  try {
    const supabase = await createClient();

    // Fetch verification status and transactions in parallel
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
          .limit(50),
        supabase
          .from('transaction_participants')
          .select('transaction_id')
          .eq('user_id', userId),
      ]);

    const isVerified =
      verificationResult.data?.verification_status === 'complete';
    const creatorTransactions = creatorTxResult.data || [];
    const participantTxIds =
      participantDataResult.data?.map((p) => p.transaction_id) || [];

    // Fetch participant transactions if any exist
    const participantTransactions =
      participantTxIds.length > 0
        ? (
            await supabase
              .from('transactions')
              .select('*, creator_name, creator_email, creator_avatar_url')
              .in('id', participantTxIds)
              .order('created_at', { ascending: false })
              .limit(50)
          ).data || []
        : [];

    // Combine and deduplicate transactions
    const allTransactionsMap = new Map();
    [...creatorTransactions, ...participantTransactions].forEach((tx) => {
      if (!allTransactionsMap.has(tx.id)) {
        allTransactionsMap.set(tx.id, tx);
      }
    });

    const allTransactions = Array.from(allTransactionsMap.values()).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Build transaction list with counterparty info
    const transactions: ProfileTransaction[] = await Promise.all(
      allTransactions.map(async (tx) => {
        const isCreator = tx.creator_id === userId;
        let counterpartyName = 'Anonymous User';

        if (isCreator) {
          const { data: participants } = await supabase
            .from('transaction_participants')
            .select('user_id')
            .eq('transaction_id', tx.id)
            .eq('role', 'invitee')
            .limit(1);

          if (participants?.[0]) {
            counterpartyName = `User ${participants[0].user_id.substring(0, 8)}`;
          }
        } else {
          counterpartyName = `User ${tx.creator_id.substring(0, 8)}`;
        }

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

    // Calculate statistics
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(
      (tx) => tx.status === 'completed'
    ).length;
    const activeTransactions = transactions.filter((tx) =>
      [
        'active',
        'pending',
        'both_joined',
        'screenshots_uploaded',
        'waiting_for_participant',
      ].includes(tx.status)
    ).length;
    const completionRate =
      totalTransactions > 0
        ? Math.round((completedTransactions / totalTransactions) * 100)
        : 0;
    const trustScore = Math.min(
      100,
      Math.round(completionRate * 0.7 + Math.min(totalTransactions * 2, 30))
    );

    // Get join date from earliest transaction
    const joinDate =
      allTransactions.length > 0
        ? new Date(allTransactions[allTransactions.length - 1].created_at)
        : new Date('2023-01-01');

    const memberSince = joinDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    // Extract user info from creator transactions
    const userInfo = creatorTransactions[0] || {};
    const userName = userInfo.creator_name || `User ${userId.substring(0, 8)}`;
    const userEmail = userInfo.creator_email || undefined;
    const userAvatar = userInfo.creator_avatar_url || undefined;

    return {
      id: userId,
      name: userName,
      email: userEmail,
      avatar: userAvatar,
      isVerified,
      stats: {
        totalTransactions,
        completedTransactions,
        activeTransactions,
        trustScore,
        joinDate: joinDate.toISOString(),
        completionRate,
      },
      recentTransactions: transactions.slice(0, 20),
      memberSince,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Determine transaction type from item name
 */
function determineTransactionType(
  itemName?: string | null
): ProfileTransaction['type'] {
  if (!itemName) return 'home-goods';

  const name = itemName.toLowerCase();
  if (name.includes('electronics')) return 'electronics';
  if (name.includes('service')) return 'services';
  return 'home-goods';
}
