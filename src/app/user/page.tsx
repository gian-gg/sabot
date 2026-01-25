'use client';

import AgreementsSection from '@/components/home/components/agreement/agreements-section';
import TransactionsSection from '@/components/home/components/transactions/transactions-section';
import { GasFeeWarningDialog } from '@/components/home/gas-fee-warning-dialog';
import { TabNavigation } from '@/components/home/tab-navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfileContent } from '@/components/user/user-profile-content';
import { useUserStore } from '@/store/user/userStore';
import { useEffect, useState, useCallback } from 'react';

import HeroAction from '@/components/home/hero-action';
import { getAgreementsByUserID } from '@/lib/supabase/db/agreements';
import { getTransactionDetailsPaginated } from '@/lib/supabase/db/transactions';
import type { AgreementWithParticipants } from '@/types/agreement';
import type {
  TransactionDetails,
  TransactionQueryParams,
} from '@/types/transaction';

export default function UserPage() {
  const user = useUserStore();

  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
  const [transactionsTotalCount, setTransactionsTotalCount] = useState(0);
  const [agreements, setAgreements] = useState<AgreementWithParticipants[]>([]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'agreements'>(
    'transactions'
  );

  const [transactionQueryParams, setTransactionQueryParams] =
    useState<TransactionQueryParams>({
      page: 1,
      pageSize: 10,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });

  // Reusable fetch function
  const refreshTransactions = useCallback(async () => {
    if (!user.id) return;
    setTransactionsLoading(true);
    try {
      const response = await getTransactionDetailsPaginated(
        user.id,
        transactionQueryParams
      );
      setTransactions(response.transactions);
      setTransactionsTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setTransactionsLoading(false);
    }
  }, [user.id, transactionQueryParams]);

  // Data fetching effect
  useEffect(() => {
    if (user.id) {
      refreshTransactions();
    }
  }, [user.id, refreshTransactions]);

  // Initial load for agreements (separate to avoid re-fetching on transaction param changes)
  useEffect(() => {
    const fetchAgreements = async () => {
      if (!user.id) return;
      try {
        const recentAgreements = await getAgreementsByUserID(user.id);
        setAgreements(recentAgreements);
      } catch (error) {
        console.error('Error fetching agreements:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      fetchAgreements();
    }
  }, [user.id]);

  const handleQueryChange = (newParams: TransactionQueryParams) => {
    setTransactionQueryParams(newParams);
  };

  return (
    <>
      <GasFeeWarningDialog />

      <UserProfileContent
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          verificationStatus: user.verificationStatus,
        }}
        stats={{
          transactionCount: transactionsTotalCount,
          rating: 4.8,
          trustScore: 95,
          completedDeals: transactions.filter((t) => t.status === 'completed')
            .length, // Note: This might be inaccurate if paginated, but acceptable for now
          pendingDeals: transactions.filter(
            (t) => t.status === 'active' || t.status === 'pending'
          ).length, // Note: This might be inaccurate if paginated
        }}
        transactions={transactions}
        isOwnProfile={true}
        heroAction={<HeroAction />}
      >
        {loading ? (
          <div className="mt-6 space-y-6">
            {/* Tabs Skeleton */}
            <Skeleton className="bg-muted h-10 w-full max-w-[400px] rounded-lg" />

            {/* List Skeletons */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="bg-muted h-24 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="mt-6">
              {activeTab === 'transactions' && (
                <TransactionsSection
                  transactions={transactions}
                  totalCount={transactionsTotalCount}
                  isLoading={transactionsLoading}
                  queryParams={transactionQueryParams}
                  onQueryChange={handleQueryChange}
                  onTransactionUpdate={refreshTransactions}
                />
              )}
              {activeTab === 'agreements' && (
                <AgreementsSection recentAgreements={agreements} />
              )}
            </div>
          </>
        )}
      </UserProfileContent>
    </>
  );
}
