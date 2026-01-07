'use client';

import { useEffect, useState } from 'react';
import { getTransactionLimitsStatus } from '@/lib/supabase/db/transactions';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Calculate totals for summary view
  const totalUsed = limits.pending.current + limits.active.current;
  const totalMax = limits.pending.max + limits.active.max;
  const totalPercentage = (totalUsed / totalMax) * 100;

  // Determine overall status color
  const isAnyAtLimit = isPendingAtLimit || isActiveAtLimit;
  const isAnyNearLimit = isPendingNearLimit || isActiveNearLimit;
  const overallStatusColor = isAnyAtLimit
    ? 'text-destructive'
    : isAnyNearLimit
      ? 'text-amber-500'
      : 'text-green-600';

  const overallBarColor = isAnyAtLimit
    ? 'bg-destructive'
    : isAnyNearLimit
      ? 'bg-amber-500'
      : 'bg-green-600';

  // Determine consolidated warning state and message
  const showConsolidatedWarning =
    isPendingAtLimit ||
    isActiveAtLimit ||
    (isPendingNearLimit && isActiveNearLimit);

  const getWarningMessage = (): {
    type: 'destructive' | 'warning';
    title: string;
  } | null => {
    // Priority 1: Both at limit
    if (isPendingAtLimit && isActiveAtLimit) {
      return {
        type: 'destructive',
        title: 'Both pending and active transaction limits reached.',
      };
    }

    // Priority 2: One at limit, one near limit
    if (isPendingAtLimit && isActiveNearLimit) {
      return {
        type: 'destructive',
        title: 'Pending limit reached. Active approaching limit.',
      };
    }
    if (isActiveAtLimit && isPendingNearLimit) {
      return {
        type: 'destructive',
        title: 'Active limit reached. Pending approaching limit.',
      };
    }

    // Priority 3: Only pending at limit
    if (isPendingAtLimit) {
      return {
        type: 'destructive',
        title: 'Pending transaction limit reached (5/5).',
      };
    }

    // Priority 4: Only active at limit
    if (isActiveAtLimit) {
      return {
        type: 'destructive',
        title: 'Active transaction limit reached (3/3).',
      };
    }

    // Priority 5: Both near limit
    if (isPendingNearLimit && isActiveNearLimit) {
      return {
        type: 'warning',
        title: 'Approaching transaction limits.',
      };
    }

    return null;
  };

  return (
    <Card className="border-muted p-0">
      <CardContent className="space-y-0 p-0">
        {/* Collapsed Summary View */}
        {!isExpanded && (
          <div className="space-y-3 px-6 pt-6 pb-2">
            {/* Summary Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Transaction Limits</h3>
              <span className={`text-sm font-semibold ${overallStatusColor}`}>
                {totalUsed}/{totalMax}
              </span>
            </div>

            {/* Summary Progress Bar */}
            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <div
                className={`h-full rounded-full transition-all duration-300 ${overallBarColor}`}
                style={{ width: `${Math.min(totalPercentage, 100)}%` }}
              />
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(true)}
              className="text-primary hover:text-primary/80 flex w-full items-center justify-center gap-2 rounded py-2 text-xs font-medium transition-colors"
            >
              <ChevronDown className="h-4 w-4" />
              View Details
            </button>
          </div>
        )}

        {/* Expanded Detailed View */}
        {isExpanded && (
          <div className="space-y-4 px-6 pt-6 pb-2">
            {/* Pending Transactions */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">
                  Pending Transactions
                </label>
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
            </div>

            {/* Active Transactions */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">
                  Active Transactions
                </label>
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
            </div>

            {/* Consolidated Warning */}
            {showConsolidatedWarning &&
              (() => {
                const warning = getWarningMessage();
                if (!warning) return null;

                const isDestructive = warning.type === 'destructive';

                return (
                  <div
                    className={`rounded-lg border p-3 ${
                      isDestructive
                        ? 'bg-destructive/10 border-destructive/20'
                        : 'border-amber-500/30 bg-amber-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle
                        className={`mb-0.5 h-4 w-4 shrink-0 ${
                          isDestructive ? 'text-destructive' : 'text-amber-600'
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-xs font-medium ${
                            isDestructive
                              ? 'text-destructive'
                              : 'text-amber-700 dark:text-amber-600'
                          }`}
                        >
                          {warning.title}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Collapse Button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="text-primary hover:text-primary/80 flex w-full items-center justify-center gap-2 rounded py-2 text-xs font-medium transition-colors"
            >
              <ChevronUp className="h-4 w-4" />
              Hide Details
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
