import CommentIndicator from '@/components/transaction/comment-indicator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatStatusLabel } from '@/lib/utils/helpers';
import type {
  TransactionDetails,
  TransactionStatus,
} from '@/types/transaction';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Users,
  XCircle,
} from 'lucide-react';
import React from 'react';

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

const statusDescriptions: Record<TransactionStatus, string> = {
  active: 'This transaction is currently active',
  pending: 'Waiting for participants to join',
  waiting_for_participant: 'Waiting for counterpart to join',
  both_joined: 'Both parties have joined',
  screenshots_uploaded: 'Screenshots have been uploaded',
  completed: 'This transaction has been completed',
  cancelled: 'This transaction was cancelled',
  disputed: 'This transaction is under dispute',
  reported: 'This transaction has been reported',
};

const TransactionItem = ({
  transaction,
  onClick,
}: {
  transaction: TransactionDetails;
  onClick?: () => void;
}) => {
  const StatusIcon = statusIcons[transaction.status];

  // Format transaction type for display
  const transactionTypeLabel =
    transaction.transaction_type === 'meetup'
      ? 'Meetup'
      : transaction.transaction_type === 'delivery'
        ? 'Delivery'
        : 'Online';

  return (
    <Card
      className={cn(
        'group relative flex flex-col gap-3 p-3 transition-all hover:shadow-md sm:h-[160px] sm:flex-row sm:gap-6 sm:p-5',
        onClick && 'hover:border-primary/50 cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex flex-1 gap-3 sm:gap-6">
        {/* Icon Section */}
        <div className="shrink-0">
          <div
            className={cn(
              'group-hover:bg-background flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
              statusColors[transaction.status]
            )}
          >
            <StatusIcon className="h-6 w-6" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate pr-2 text-base font-semibold">
                {transaction.item_name}
              </h3>
              <Badge
                variant="outline"
                className="shrink-0 text-[10px] tracking-wider uppercase"
              >
                {transactionTypeLabel}
              </Badge>
            </div>

            {transaction.item_description ? (
              <p className="text-muted-foreground hidden text-sm sm:line-clamp-1 sm:block">
                {transaction.item_description}
              </p>
            ) : (
              <p className="text-muted-foreground/60 hidden text-sm italic sm:block">
                {statusDescriptions[transaction.status] ??
                  'No description provided'}
              </p>
            )}
          </div>

          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {transaction.category && (
              <Badge
                variant="secondary"
                className="bg-secondary/50 hover:bg-secondary px-2 py-0.5 text-xs font-normal"
              >
                {transaction.category}
              </Badge>
            )}
            {transaction.condition && (
              <Badge
                variant="secondary"
                className="bg-secondary/50 hover:bg-secondary px-2 py-0.5 text-xs font-normal"
              >
                {transaction.condition}
              </Badge>
            )}
            {transaction.transaction_type === 'meetup' &&
              transaction.meeting_location && (
                <div className="text-muted-foreground bg-muted/30 flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs">
                  <div className="bg-primary/60 h-1.5 w-1.5 rounded-full" />
                  <span className="max-w-[150px] truncate">
                    {transaction.meeting_location}
                  </span>
                </div>
              )}
          </div>

          <div className="text-muted-foreground flex items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span className="text-foreground/80 font-medium">
                {transaction.transaction_participants?.length > 1
                  ? transaction.transaction_participants.find(
                      (p) => p.role !== 'creator'
                    )?.participant_name || 'Participant'
                  : 'No Participant'}
              </span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <span className="font-medium">
              {new Date(transaction.created_at).toLocaleDateString()}
            </span>
            {transaction.comment_count !== undefined &&
              transaction.comment_count > 0 && (
                <>
                  <span className="text-muted-foreground/40">•</span>
                  <CommentIndicator count={transaction.comment_count} />
                </>
              )}
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex shrink-0 flex-row items-center justify-between gap-4 border-t pt-3 sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:pt-0">
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
            Price
          </span>
          <span className="text-xl font-bold tracking-tight">
            $ {transaction.price?.toLocaleString() ?? '0'}
          </span>
        </div>

        <Badge
          variant="outline"
          className={cn(
            'px-2.5 py-1 text-xs font-medium capitalize',
            statusColors[transaction.status]
          )}
        >
          {formatStatusLabel(transaction.status)}
        </Badge>
      </div>
    </Card>
  );
};

export default TransactionItem;
