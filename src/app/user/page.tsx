'use client';

import AgreementsSection from '@/components/home/components/agreement/agreements-section';
import TransactionsSection from '@/components/home/components/transactions/transactions-section';
import { GasFeeWarningDialog } from '@/components/home/gas-fee-warning-dialog';
import { TabNavigation } from '@/components/home/tab-navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionItemSkeleton } from '@/components/home/components/transactions/transaction-item-skeleton';
import { IdentityVerificationRequired } from '@/components/user/identity-verification-required';
import { VerificationInstructions } from '@/components/user/verification-instructions';
import { UserProfileContent } from '@/components/user/user-profile-content';
import { useUserStore } from '@/store/user/userStore';
import { useCallback, useEffect, useState } from 'react';

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

  // Reusable fetch function for transactions
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

  // Reusable fetch function for agreements
  const refreshAgreements = useCallback(async () => {
    if (!user.id) return;
    try {
      const recentAgreements = await getAgreementsByUserID(user.id);
      setAgreements(recentAgreements);
    } catch (error) {
      console.error('Error fetching agreements:', error);
    }
  }, [user.id]);

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
        await refreshAgreements();
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      fetchAgreements();
    }
  }, [user.id, refreshAgreements]);

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
        transactions={transactions}
        isOwnProfile={true}
        heroAction={<HeroAction />}
      >
        {loading ? (
          <div className="mt-6 space-y-6">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                    <div className="mt-2 space-y-1">
                      <Skeleton className="h-7 w-20" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Chart Skeleton */}
            <Card className="min-w-0">
              <CardContent className="p-6">
                <div className="mb-6 space-y-1.5">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-[250px] w-full rounded-xl" />
              </CardContent>
            </Card>

            {/* Tabs Skeleton */}
            <Skeleton className="bg-muted h-10 w-full max-w-[400px] rounded-lg" />

            {/* List Skeletons */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <TransactionItemSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : user.verificationStatus === 'verified' ? (
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
                <AgreementsSection
                  recentAgreements={agreements}
                  onAgreementUpdate={refreshAgreements}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <IdentityVerificationRequired
              userId={user.id}
              status={user.verificationStatus}
            />
            <VerificationInstructions />
          </>
        )}
      </UserProfileContent>
    </>
  );
}
