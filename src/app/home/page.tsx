import React from 'react';
import Link from 'next/link';
import { Shield, Plus, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mockTransactions } from '@/lib/mock-data/transactions';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@/types/transaction';

// Helper function to get status badge variant
function getStatusBadgeVariant(
  status: TransactionStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'active':
      return 'secondary';
    case 'pending':
      return 'outline';
    case 'reported':
      return 'destructive';
    default:
      return 'default';
  }
}

// Helper function to get transaction type display name
function getTransactionTypeLabel(type: TransactionType): string {
  switch (type) {
    case 'electronics':
      return 'Electronics';
    case 'services':
      return 'Services';
    case 'fashion':
      return 'Fashion';
    case 'home-goods':
      return 'Home Goods';
    case 'vehicles':
      return 'Vehicles';
    case 'collectibles':
      return 'Collectibles';
    case 'other':
      return 'Other';
    default:
      return 'Unknown';
  }
}

// Helper function to format timestamp
function formatTimestamp(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Helper function to blur name (keep first name + initial)
function blurName(fullName: string): string {
  const parts = fullName.split(' ');
  if (parts.length === 1) return fullName;
  return `${parts[0]} ${parts[1].charAt(0)}.`;
}

export default async function Home() {
  // Sort transactions by timestamp (newest first)
  const transactions = [...mockTransactions].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/60 shadow-lg backdrop-blur-2xl">
        <div className="mx-auto max-w-[1280px] px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand */}
            <Link
              href={ROUTES.ROOT}
              className="flex items-center gap-2 transition-opacity duration-150 hover:opacity-80"
            >
              <Shield className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Sabot
              </h1>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href={ROUTES.AUTH.SIGN_IN}>Sign In</Link>
              </Button>
              <Button asChild>
                <Link href={ROUTES.AUTH.SIGN_UP}>Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1280px] px-6 py-16 lg:px-8 lg:py-24">
        {/* Welcome Section */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-5xl font-bold tracking-tight text-white lg:text-6xl">
            Public Transaction Ledger
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-7 text-white/70">
            Real-time feed of all verified and completed transactions on Sabot
          </p>
        </div>

        {/* Transactions Card */}
        <Card className="mb-12 border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">
              All Transactions
            </CardTitle>
            <CardDescription className="text-white/60">
              Blockchain-inspired transparency — every verified transaction is
              publicly recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <Link
                  key={transaction.id}
                  href={`/transaction/${transaction.id}`}
                  className="group block rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-250 hover:border-white/20 hover:bg-white/10 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left Section - Transaction Details */}
                    <div className="flex-1 space-y-1">
                      {/* Transaction Type & ID */}
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-white">
                          {getTransactionTypeLabel(transaction.type)}
                        </p>
                        <span className="text-xs text-white/30">•</span>
                        <p className="font-mono text-xs text-white/50">
                          {transaction.id}
                        </p>
                      </div>

                      {/* Participants */}
                      <p className="text-sm text-white/70">
                        <span className="text-blue-400">
                          {blurName(transaction.buyerName)}
                        </span>{' '}
                        →{' '}
                        <span className="text-purple-400">
                          {blurName(transaction.sellerName)}
                        </span>
                      </p>

                      {/* Location & Timestamp */}
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <span>{transaction.location}</span>
                        <span>•</span>
                        <span>{formatTimestamp(transaction.timestamp)}</span>
                        {transaction.platform && (
                          <>
                            <span>•</span>
                            <span>{transaction.platform}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Price & Status */}
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xl font-bold text-white">
                        {transaction.currency}
                        {transaction.price.toLocaleString()}
                      </p>
                      <Badge
                        variant={getStatusBadgeVariant(transaction.status)}
                      >
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="h-5 w-5 text-white/40 transition-transform duration-150 group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Section */}
        <div className="flex justify-center">
          <Button
            size="lg"
            className="w-full max-w-md bg-white text-neutral-950 shadow-xl transition-all duration-250 hover:scale-105 hover:bg-neutral-100 hover:shadow-2xl"
            asChild
          >
            <Link href="/transaction/new">
              <Plus className="mr-2 h-5 w-5" />
              Create New Transaction
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-8 backdrop-blur-xl">
        <div className="mx-auto max-w-[1280px] px-6 text-center lg:px-8">
          <p className="text-sm text-white/50">
            Made with ♥ by{' '}
            <a
              href={ROUTES.SOCIALS.GITHUB}
              target="_blank"
              rel="noreferrer"
              className="text-white underline underline-offset-4 transition-opacity duration-150 hover:opacity-70"
            >
              untitled
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
