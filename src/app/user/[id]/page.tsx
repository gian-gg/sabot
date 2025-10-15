import React from 'react';
import Link from 'next/link';
import { Shield, Mail, Calendar, TrendingUp } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/core/page-header';
import { UserAvatar } from '@/components/user/user-avatar';
import { VerificationBadge } from '@/components/user/verification-badge';
import { getUserById } from '@/lib/mock-data/users';
import { mockTransactions } from '@/lib/mock-data/transactions';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const user = getUserById(id);

  if (!user) {
    return (
      <div className="flex h-screen w-screen flex-col bg-black">
        <PageHeader />
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md border-neutral-800/60 bg-neutral-900/40">
            <CardContent className="pt-6">
              <p className="text-center text-neutral-400">User not found</p>
              <Button asChild className="mt-4 w-full">
                <Link href={ROUTES.HOME.ROOT}>Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get user's transactions
  const userTransactions = mockTransactions.filter(
    (t) =>
      t.buyerName.includes(user.name.split(' ')[0]) ||
      t.sellerName.includes(user.name.split(' ')[0])
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      <PageHeader />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1000px] space-y-6 px-8 py-8">
          {/* Profile Header Card */}
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardContent className="pt-6">
              <div className="flex flex-col items-start gap-6 md:flex-row">
                <UserAvatar name={user.name} avatar={user.avatar} size="xl" />

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <h1 className="text-2xl font-bold text-white">
                        {user.name}
                      </h1>
                      <VerificationBadge isVerified={user.isVerified} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-400">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-neutral-500">Rating</span>
                      </div>
                      <p className="text-xl font-semibold text-white">
                        {user.rating}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <span className="text-xs text-neutral-500">Joined</span>
                      </div>
                      <p className="text-sm font-medium text-white">
                        {user.joinDate.toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span className="text-xs text-neutral-500">
                          Transactions
                        </span>
                      </div>
                      <p className="text-xl font-semibold text-white">
                        {user.transactionCount}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-neutral-200"
                      asChild
                    >
                      <Link href={ROUTES.EMERGENCY}>Set Emergency Contact</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History Card */}
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardHeader>
              <CardTitle className="text-white">Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {userTransactions.length > 0 ? (
                <div className="space-y-3">
                  {userTransactions.map((transaction) => (
                    <Link
                      key={transaction.id}
                      href={ROUTES.TRANSACTION.VIEW(transaction.id)}
                      className="block rounded-lg border border-neutral-800/50 bg-black/20 p-4 transition-colors hover:bg-neutral-900/40"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">
                            {transaction.type.charAt(0).toUpperCase() +
                              transaction.type.slice(1).replace('-', ' ')}
                          </p>
                          <p className="mt-1 text-xs text-neutral-400">
                            {transaction.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">
                            {transaction.currency}
                            {transaction.price.toLocaleString()}
                          </p>
                          <Badge
                            variant={
                              transaction.status === 'completed'
                                ? 'default'
                                : 'secondary'
                            }
                            className="mt-1"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-neutral-400">
                  No transactions yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
