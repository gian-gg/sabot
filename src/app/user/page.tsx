'use client';

import AgreementsSection from '@/components/home/components/agreement/agreements-section';
import TransactionsSection from '@/components/home/components/transactions/transactions-section';
import { GasFeeWarningDialog } from '@/components/home/gas-fee-warning-dialog';
import { TabNavigation } from '@/components/home/tab-navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfileContent } from '@/components/user/user-profile-content';
import { ROUTES } from '@/constants/routes';
import { useUserStore } from '@/store/user/userStore';
import { ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
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
        ) : user.verificationStatus === 'complete' ? (
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
        ) : (
          <div className="mt-8">
            <Card className="group relative w-full overflow-hidden border-neutral-800 bg-black/40 p-0 transition-colors hover:border-neutral-700">
              <div className="bg-grid-white/[0.02] absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent opacity-50" />

              <div className="relative z-10 flex flex-col items-center justify-between gap-6 p-6 sm:flex-row sm:p-8">
                <div className="flex flex-1 flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
                  <div className="shrink-0 pt-1">
                    <div className="flex size-14 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)]">
                      <Shield className="size-7 text-amber-500" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold tracking-tight text-white">
                      Identity Verification Required
                    </h2>
                    <p className="max-w-xl text-sm leading-relaxed text-neutral-400">
                      Unlock full platform capabilities including higher limits,
                      trust badges, and premium features by verifying your
                      identity.
                    </p>
                  </div>
                </div>

                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 w-full shrink-0 px-6 font-medium shadow-[0_0_20px_-5px_rgba(var(--primary),0.3)] transition-all sm:w-auto"
                  asChild
                >
                  <Link href={ROUTES.USER.VERIFY}>
                    Verify Identity
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        )}
      </UserProfileContent>
    </>
  );
}
