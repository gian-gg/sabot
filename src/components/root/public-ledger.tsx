import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@/types/transaction';

interface PublicLedgerProps {
  transactions: Transaction[];
}

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

export function PublicLedger({ transactions }: PublicLedgerProps) {
  // Limit to 10 most recent transactions
  const recentTransactions = transactions.slice(0, 10);

  return (
    <Card className="gap-0 border border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60 p-0 shadow-2xl backdrop-blur-sm">
      <CardHeader className="flex w-full items-center justify-between gap-0 border-b border-neutral-800/50 bg-neutral-900/30 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
            <div className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
          </div>
          <span className="text-xs font-medium text-neutral-300">
            Public Ledger
          </span>
        </div>
        <Badge
          variant="outline"
          className="h-5 border-green-500/30 bg-green-500/10 text-xs text-green-400"
        >
          Live
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        {/* Ledger Header */}
        <div className="border-b border-neutral-800/50 bg-neutral-900/20 px-5 py-4">
          <h2 className="mb-1.5 text-lg font-semibold text-white">
            Recent Transactions
          </h2>
          <p className="text-xs text-neutral-400">
            Live feed of the latest 10 verified transactions
          </p>
        </div>

        {/* Transaction List - Limited to 10 */}
        <div className="divide-y divide-neutral-800/50">
          {recentTransactions.map((transaction) => (
            <Link
              key={transaction.id}
              href={`/transaction/${transaction.id}`}
              className="group block bg-black/20 px-5 py-4 transition-all duration-200 hover:bg-neutral-900/40"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left Section */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                    <span className="text-neutral-500">•</span>
                    <span className="font-mono text-[10px] text-neutral-400">
                      {transaction.id}
                    </span>
                  </div>

                  <div className="text-sm text-neutral-300">
                    <span className="font-medium text-blue-400">
                      {blurName(transaction.buyerName)}
                    </span>
                    {' → '}
                    <span className="font-medium text-purple-400">
                      {blurName(transaction.sellerName)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
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

                {/* Right Section */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {transaction.currency}
                      {transaction.price.toLocaleString()}
                    </p>
                    <Badge
                      variant={getStatusBadgeVariant(transaction.status)}
                      className="mt-1 h-5 text-[10px]"
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </Badge>
                  </div>

                  <ChevronRight className="h-5 w-5 text-neutral-500 transition-all duration-200 group-hover:translate-x-1 group-hover:text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
