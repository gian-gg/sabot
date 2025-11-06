'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Activity,
  Users,
  Shield,
  Search,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ProfileTransaction } from '@/types/profile';
import type { TransactionStatus } from '@/types/transaction';

interface TransactionHistoryListProps {
  transactions: ProfileTransaction[];
  showFilter?: boolean;
}

const statusIcons: Record<TransactionStatus, React.ElementType> = {
  completed: CheckCircle2,
  active: Activity,
  pending: Clock,
  disputed: XCircle,
  reported: AlertCircle,
  waiting_for_participant: Clock,
  both_joined: Users,
  screenshots_uploaded: Shield,
  cancelled: XCircle,
};

const statusColors: Record<TransactionStatus, string> = {
  completed: 'text-green-500 bg-green-500/10 border-green-500/20',
  active: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  pending: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  disputed: 'text-red-500 bg-red-500/10 border-red-500/20',
  reported: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  waiting_for_participant:
    'text-purple-500 bg-purple-500/10 border-purple-500/20',
  both_joined: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  screenshots_uploaded:
    'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
};

function TransactionItem({ transaction }: { transaction: ProfileTransaction }) {
  const StatusIcon = statusIcons[transaction.status];

  // Format transaction type for display
  const transactionTypeLabel = transaction.type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="hover:bg-muted/50 flex cursor-pointer flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10',
            statusColors[transaction.status]
          )}
        >
          <StatusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <p className="truncate text-sm font-medium sm:text-base">
              {transaction.title}
            </p>
            <Badge variant="outline" className="text-[10px] sm:text-xs">
              {transactionTypeLabel}
            </Badge>
          </div>
          <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
            <span className="truncate">{transaction.counterpartyName}</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-[10px] sm:text-xs">
              {new Date(transaction.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pl-12 sm:flex-col sm:items-end sm:justify-center sm:gap-1 sm:pl-0">
        {transaction.amount && (
          <p className="text-sm font-semibold sm:text-base">
            {transaction.currency || '$'} {transaction.amount.toLocaleString()}
          </p>
        )}
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] sm:text-xs',
            statusColors[transaction.status]
          )}
        >
          {transaction.status}
        </Badge>
      </div>
    </div>
  );
}

export function TransactionHistoryList({
  transactions,
  showFilter = true,
}: TransactionHistoryListProps) {
  const [activeTab, setActiveTab] = useState<string>('all');

  // Filter transactions by status
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'completed') return tx.status === 'completed';
    if (activeTab === 'active')
      return [
        'active',
        'pending',
        'both_joined',
        'screenshots_uploaded',
      ].includes(tx.status);
    if (activeTab === 'issues')
      return ['reported', 'disputed'].includes(tx.status);
    return true;
  });

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-base sm:text-lg">
          Recent Transactions
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Your latest transaction activity
          {filteredTransactions.length !== transactions.length && (
            <span className="text-primary ml-2">
              ({filteredTransactions.length} of {transactions.length})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-4 md:px-6">
        {/* Tabs for filtering */}
        {showFilter && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-3 sm:mb-4"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">
                Completed
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs sm:text-sm">
                Active
              </TabsTrigger>
              <TabsTrigger value="issues" className="text-xs sm:text-sm">
                Issues
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Transaction List */}
        <div className="space-y-2 sm:space-y-3">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center sm:py-12">
              <Search className="mb-2 h-10 w-10 opacity-20 sm:mb-3 sm:h-12 sm:w-12" />
              <p className="text-xs sm:text-sm">No transactions found</p>
              <p className="text-[10px] sm:text-xs">
                {activeTab === 'all'
                  ? 'This user has not completed any transactions yet'
                  : `No ${activeTab} transactions`}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
