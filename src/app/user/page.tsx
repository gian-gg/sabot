'use client';

import AgreementsSection from '@/components/home/components/agreement/agreements-section';
import TransactionsSection from '@/components/home/components/transactions/transactions-section';
import { GasFeeWarningDialog } from '@/components/home/gas-fee-warning-dialog';
import { TabNavigation } from '@/components/home/tab-navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { UserProfileContent } from '@/components/user/user-profile-content';
import { useUserStore } from '@/store/user/userStore';
import { useEffect, useState } from 'react';

import HeroAction from '@/components/home/hero-action';
import { getAgreementsByUserID } from '@/lib/supabase/db/agreements';
import { getTransactionDetailsByUserID } from '@/lib/supabase/db/transactions';
import type { AgreementWithParticipants } from '@/types/agreement';
import type { TransactionDetails } from '@/types/transaction';

export default function UserPage() {
  const user = useUserStore();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
  const [agreements, setAgreements] = useState<AgreementWithParticipants[]>([]);
  const [activeTab, setActiveTab] = useState<'transactions' | 'agreements'>(
    'transactions'
  );

  useEffect(() => {
    setLoading(true);
    const fetchData = async (userid: string) => {
      const [recentTransactions, recentAgreements] = await Promise.all([
        getTransactionDetailsByUserID(userid),
        getAgreementsByUserID(userid),
      ]);
      setTransactions(recentTransactions);
      setAgreements(recentAgreements);
      setLoading(false);
    };

    if (user.id) {
      fetchData(user.id);
    }
  }, [user.id]);

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
          transactionCount: transactions.length,
          rating: 4.8,
          trustScore: 95,
          completedDeals: transactions.filter((t) => t.status === 'completed')
            .length,
          pendingDeals: transactions.filter(
            (t) => t.status === 'active' || t.status === 'pending'
          ).length,
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
                <TransactionsSection recentTransactions={transactions} />
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
