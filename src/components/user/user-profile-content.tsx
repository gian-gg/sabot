'use client';

import TransactionsSection from '@/components/home/components/transactions/transactions-section';
import { ProfileAlert } from '@/components/profile/profile-alert';
import { Button } from '@/components/ui/button';
import { UserProfileHeader } from '@/components/user/user-profile-header';
import { ROUTES } from '@/constants/routes';
import type { TransactionDetails } from '@/types/transaction';
import type { VerificationStatus } from '@/types/user';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface UserProfileContentProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: 'admin' | 'user';
    verificationStatus?: VerificationStatus;
  };
  transactions: TransactionDetails[];
  isOwnProfile?: boolean;
  heroAction?: React.ReactNode;
  children?: React.ReactNode; // For tabs or extra content if needed
  showBackButton?: boolean;
}

export function UserProfileContent({
  user,
  transactions,
  isOwnProfile = false,
  heroAction,
  children,
  showBackButton = false,
}: UserProfileContentProps) {
  const hasTransactions = transactions.length > 0;
  const isVerified = user.verificationStatus === 'verified';

  return (
    <div className="min-h-[70vh] space-y-8">
      {/* Back Button */}
      {showBackButton && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-2 pl-0"
            asChild
          >
            <Link href={ROUTES.USER.ROOT}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      )}

      {/* User Profile Header */}
      <UserProfileHeader user={user} isOwnProfile={isOwnProfile} />

      {/* Alerts for unverified users */}
      {!isVerified && !isOwnProfile && (
        <ProfileAlert
          type="warning"
          title="Unverified User"
          message="This user has not completed identity verification. Transaction history is hidden for unverified users."
        />
      )}

      {/* No Transactions Alert (only for public view) */}
      {isVerified && !hasTransactions && !isOwnProfile && (
        <ProfileAlert
          type="info"
          title="No Transaction History"
          message="This user hasn't completed any transactions yet."
        />
      )}

      {/* Content Section (Transactions/Activity) */}
      {(isVerified || isOwnProfile) && (
        <div className="mt-10">
          {isVerified && (
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  className={
                    isOwnProfile
                      ? 'hidden text-xl font-bold text-white sm:block'
                      : 'text-xl font-bold text-white'
                  }
                >
                  {isOwnProfile ? 'Your Activity' : 'Transaction History'}
                </h2>
                <p
                  className={
                    isOwnProfile
                      ? 'hidden text-sm text-neutral-400 sm:block'
                      : 'text-sm text-neutral-400'
                  }
                >
                  {isOwnProfile
                    ? 'Manage your transactions and agreements'
                    : 'Recent transactions with this user'}
                </p>
              </div>
              <div className="w-full sm:w-auto">{heroAction}</div>
            </div>
          )}

          {/* Render children (tabs for own profile) or direct transaction list (public profile) */}
          {children
            ? children
            : hasTransactions && (
                <TransactionsSection
                  transactions={transactions}
                  totalCount={transactions.length}
                  queryParams={{
                    page: 1,
                    pageSize: 10,
                    search: '',
                    status: 'all',
                    type: 'all',
                    dateRange: 'all',
                    sortBy: 'created_at',
                    sortOrder: 'desc',
                  }}
                  onQueryChange={() => {}}
                  readOnly={!isOwnProfile}
                />
              )}
        </div>
      )}
    </div>
  );
}
