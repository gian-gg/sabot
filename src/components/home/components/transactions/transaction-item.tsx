import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TransactionStatus } from '@/types/transaction';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  XCircle,
  Activity,
  Shield,
  Users,
} from 'lucide-react';

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
  transaction: {
    id: string;
    item: string;
    type: string;
    amount: number;
    status: TransactionStatus;
    date: string;
    counterparty: string;
  };
  onClick?: () => void;
}) => {
  const StatusIcon = statusIcons[transaction.status];

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle more actions menu
  };

  return (
    <div
      className="hover:bg-muted/50 flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors"
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
            <p className="font-medium">{transaction.item}</p>
            <Badge variant="outline" className="text-xs">
              {transaction.type}
            </Badge>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>{transaction.counterparty}</span>
            <span>•</span>
            <span>{transaction.date}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold">
            ${transaction.amount.toLocaleString()}
          </p>
          <Badge
            variant="outline"
            className={cn('text-xs', statusColors[transaction.status])}
          >
            {transaction.status}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleMoreClick}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TransactionItem;
