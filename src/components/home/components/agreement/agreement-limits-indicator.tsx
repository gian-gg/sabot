'use client';

import { useEffect, useState } from 'react';
import { getAgreementLimitsStatus } from '@/lib/supabase/db/agreements';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface AgreementLimitsStatus {
  waiting: {
    current: number;
    max: number;
    canCreate: boolean;
  };
  inProgress: {
    current: number;
    max: number;
    canCreate: boolean;
  };
  canCreateAgreement: boolean;
}

interface AgreementLimitsIndicatorProps {
  userId: string;
}

export function AgreementLimitsIndicator({
  userId,
}: AgreementLimitsIndicatorProps) {
  const [limits, setLimits] = useState<AgreementLimitsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (userId) {
      getAgreementLimitsStatus(userId)
        .then(setLimits)
        .catch((error) => {
          console.error('Failed to fetch agreement limits:', error);
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

  const waitingPercentage = (limits.waiting.current / limits.waiting.max) * 100;
  const inProgressPercentage =
    (limits.inProgress.current / limits.inProgress.max) * 100;

  const isWaitingNearLimit = waitingPercentage >= 80;
  const isInProgressNearLimit = inProgressPercentage >= 80;
  const isWaitingAtLimit = !limits.waiting.canCreate;
  const isInProgressAtLimit = !limits.inProgress.canCreate;

  // Calculate totals for summary view
  const totalUsed = limits.waiting.current + limits.inProgress.current;
  const totalMax = limits.waiting.max + limits.inProgress.max;
  const totalPercentage = (totalUsed / totalMax) * 100;

  // Determine overall status color
  const isAnyAtLimit = isWaitingAtLimit || isInProgressAtLimit;
  const isAnyNearLimit = isWaitingNearLimit || isInProgressNearLimit;
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
    isWaitingAtLimit ||
    isInProgressAtLimit ||
    (isWaitingNearLimit && isInProgressNearLimit);

  const getWarningMessage = (): {
    type: 'destructive' | 'warning';
    title: string;
  } | null => {
    // Priority 1: Both at limit
    if (isWaitingAtLimit && isInProgressAtLimit) {
      return {
        type: 'destructive',
        title: 'Both waiting and in-progress agreement limits reached.',
      };
    }

    // Priority 2: One at limit, one near limit
    if (isWaitingAtLimit && isInProgressNearLimit) {
      return {
        type: 'destructive',
        title: 'Waiting limit reached. In-progress approaching limit.',
      };
    }
    if (isInProgressAtLimit && isWaitingNearLimit) {
      return {
        type: 'destructive',
        title: 'In-progress limit reached. Waiting approaching limit.',
      };
    }

    // Priority 3: Only waiting at limit
    if (isWaitingAtLimit) {
      return {
        type: 'destructive',
        title: 'Waiting agreement limit reached (2/2).',
      };
    }

    // Priority 4: Only in-progress at limit
    if (isInProgressAtLimit) {
      return {
        type: 'destructive',
        title: 'In-progress agreement limit reached (3/3).',
      };
    }

    // Priority 5: Both near limit
    if (isWaitingNearLimit && isInProgressNearLimit) {
      return {
        type: 'warning',
        title: 'Approaching agreement limits.',
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
              <h3 className="text-sm font-medium">Agreement Limits</h3>
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
            {/* Waiting Agreements */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">
                  Waiting for Participant
                </label>
                <span
                  className={`text-sm font-semibold ${
                    isWaitingAtLimit
                      ? 'text-destructive'
                      : isWaitingNearLimit
                        ? 'text-amber-500'
                        : 'text-green-600'
                  }`}
                >
                  {limits.waiting.current}/{limits.waiting.max}
                </span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isWaitingAtLimit
                      ? 'bg-destructive'
                      : isWaitingNearLimit
                        ? 'bg-amber-500'
                        : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(waitingPercentage, 100)}%` }}
                />
              </div>
            </div>

            {/* In-Progress Agreements */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">
                  In-Progress Agreements
                </label>
                <span
                  className={`text-sm font-semibold ${
                    isInProgressAtLimit
                      ? 'text-destructive'
                      : isInProgressNearLimit
                        ? 'text-amber-500'
                        : 'text-green-600'
                  }`}
                >
                  {limits.inProgress.current}/{limits.inProgress.max}
                </span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isInProgressAtLimit
                      ? 'bg-destructive'
                      : isInProgressNearLimit
                        ? 'bg-amber-500'
                        : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(inProgressPercentage, 100)}%` }}
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
                              : 'text-amber-700'
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
