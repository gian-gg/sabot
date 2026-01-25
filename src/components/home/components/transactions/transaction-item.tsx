import CommentIndicator from '@/components/transaction/comment-indicator';
import { Badge } from '@/components/ui/badge';
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
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border p-4 transition-colors',
        onClick && 'hover:bg-muted/50 cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            statusColors[transaction.status]
          )}
        >
          <StatusIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{transaction.item_name}</p>
            <Badge variant="outline" className="text-xs">
              {transactionTypeLabel}
            </Badge>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>
              {transaction.transaction_participants?.length > 1
                ? transaction.transaction_participants.find(
                    (p) => p.role !== 'creator'
                  )?.participant_name || 'N/A'
                : 'N/A'}
            </span>
            <span>•</span>
            <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
            {transaction.comment_count !== undefined &&
              transaction.comment_count > 0 && (
                <>
                  <span>•</span>
                  <CommentIndicator count={transaction.comment_count} />
                </>
              )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold">$ {transaction.price ?? 0}</p>
          <Badge
            variant="outline"
            className={cn('text-xs', statusColors[transaction.status])}
          >
            {formatStatusLabel(transaction.status)}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
