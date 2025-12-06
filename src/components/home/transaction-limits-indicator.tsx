'use client';

import { useEffect, useState } from 'react';
import { getTransactionLimitsStatus } from '@/lib/supabase/db/transactions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface LimitsStatus {
  pending: {
    current: number;
    max: number;
    canCreate: boolean;
  };
  active: {
    current: number;
    max: number;
    canCreate: boolean;
  };
  canCreateTransaction: boolean;
}

interface TransactionLimitsIndicatorProps {
  userId: string;
}

export function TransactionLimitsIndicator({
  userId,
}: TransactionLimitsIndicatorProps) {
  const [limits, setLimits] = useState<LimitsStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      getTransactionLimitsStatus(userId)
        .then(setLimits)
        .catch((error) => {
          console.error('Failed to fetch transaction limits:', error);
          setLimits(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (loading || !limits) {
    return null;
  }

  const pendingPercentage = (limits.pending.current / limits.pending.max) * 100;
  const activePercentage = (limits.active.current / limits.active.max) * 100;

  const isPendingNearLimit = pendingPercentage >= 80;
  const isActiveNearLimit = activePercentage >= 80;
  const isPendingAtLimit = !limits.pending.canCreate;
  const isActiveAtLimit = !limits.active.canCreate;

  return (
    <Card className="border-muted">
      <CardContent className="space-y-4">
        {/* Pending Transactions */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Pending Transactions</label>
            <span
              className={`text-sm font-semibold ${
                isPendingAtLimit
                  ? 'text-destructive'
                  : isPendingNearLimit
                    ? 'text-amber-500'
                    : 'text-green-600'
              }`}
            >
              {limits.pending.current}/{limits.pending.max}
            </span>
          </div>
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isPendingAtLimit
                  ? 'bg-destructive'
                  : isPendingNearLimit
                    ? 'bg-amber-500'
                    : 'bg-green-600'
              }`}
              style={{ width: `${Math.min(pendingPercentage, 100)}%` }}
            />
          </div>
          {isPendingAtLimit && (
            <div className="bg-destructive/10 mt-2 flex items-center gap-2 rounded p-2">
              <AlertCircle className="text-destructive h-4 w-4" />
              <p className="text-destructive text-xs">
                Delete or complete transactions to create new ones.
              </p>
            </div>
          )}
          {isPendingNearLimit && !isPendingAtLimit && (
            <p className="mt-2 text-xs text-amber-600">
              Approaching limit. You have{' '}
              {limits.pending.max - limits.pending.current} slot(s) remaining.
            </p>
          )}
        </div>

        {/* Active Transactions */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Active Transactions</label>
            <span
              className={`text-sm font-semibold ${
                isActiveAtLimit
                  ? 'text-destructive'
                  : isActiveNearLimit
                    ? 'text-amber-500'
                    : 'text-green-600'
              }`}
            >
              {limits.active.current}/{limits.active.max}
            </span>
          </div>
          <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isActiveAtLimit
                  ? 'bg-destructive'
                  : isActiveNearLimit
                    ? 'bg-amber-500'
                    : 'bg-green-600'
              }`}
              style={{ width: `${Math.min(activePercentage, 100)}%` }}
            />
          </div>
          {isActiveAtLimit && (
            <div className="bg-destructive/10 mt-2 flex items-center gap-2 rounded p-2">
              <AlertCircle className="text-destructive h-4 w-4" />
              <p className="text-destructive text-xs">
                Complete or cancel transactions to create new ones.
              </p>
            </div>
          )}
          {isActiveNearLimit && !isActiveAtLimit && (
            <p className="mt-2 text-xs text-amber-600">
              Approaching limit. You have{' '}
              {limits.active.max - limits.active.current} slot(s) remaining.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
