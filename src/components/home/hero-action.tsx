'use client';

import { ROUTES } from '@/constants/routes';
import { useUserStore } from '@/store/user/userStore';
import { BadgeCheck, Clock, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { useRegisterWallet } from '@/hooks/useRegisterWallet';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Handshake } from 'lucide-react';
import {
  getTransactionLimitsStatus,
  type TransactionLimitsStatus,
} from '@/lib/supabase/db/transactions';
import { TransactionLimitsIndicator } from './transaction-limits-indicator';

const HeroAction = () => {
  const user = useUserStore();
  const [limits, setLimits] = useState<TransactionLimitsStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useRegisterWallet(user.verificationStatus === 'complete');

  // Fetch transaction limits
  useEffect(() => {
    if (user.id && user.verificationStatus === 'complete') {
      getTransactionLimitsStatus(user.id)
        .then(setLimits)
        .catch((error) => {
          console.error('Failed to fetch transaction limits:', error);
          setLimits(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user.id, user.verificationStatus]);

  if (user.verificationStatus === 'not-started') {
    return (
      <Button asChild>
        <Link href={ROUTES.HOME.VERIFY} className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4" />
          Verify Account
        </Link>
      </Button>
    );
  }

  if (user.verificationStatus === 'pending') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>
              <Clock className="mr-2 h-4 w-4" />
              Pending Verification
            </Button>
          </TooltipTrigger>
          <TooltipContent align="center" side="right">
            <p>Verifying account, kindly check again later.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Determine if transaction creation is disabled
  const transactionDisabled =
    !limits || !limits.canCreateTransaction || loading;
  const transactionLimitHit = limits && !limits.canCreateTransaction;

  let limitTooltip = '';
  if (transactionLimitHit) {
    const pendingHit = !limits.pending.canCreate;
    const activeHit = !limits.active.canCreate;

    if (pendingHit && activeHit) {
      limitTooltip = `Pending limit reached (${limits.pending.current}/${limits.pending.max}) and Active limit reached (${limits.active.current}/${limits.active.max})`;
    } else if (pendingHit) {
      limitTooltip = `Pending transaction limit reached (${limits.pending.current}/${limits.pending.max}). Delete or complete some transactions.`;
    } else if (activeHit) {
      limitTooltip = `Active transaction limit reached (${limits.active.current}/${limits.active.max}). Complete or cancel some transactions.`;
    }
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={transactionDisabled}>
            <Plus className="size-4" />
            Create
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  disabled={transactionDisabled}
                  asChild={!transactionDisabled}
                >
                  {!transactionDisabled ? (
                    <Link
                      href={ROUTES.TRANSACTION.INVITE}
                      className="flex items-center gap-2"
                    >
                      <BadgeCheck className="h-4 w-4" />
                      <span>Transaction</span>
                      {limits && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          ({limits.pending.current}/{limits.pending.max})
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4" />
                      <span>Transaction</span>
                      {limits && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          ({limits.pending.current}/{limits.pending.max})
                        </span>
                      )}
                    </div>
                  )}
                </DropdownMenuItem>
              </TooltipTrigger>
              {transactionLimitHit && (
                <TooltipContent side="right" className="max-w-xs">
                  <p>{limitTooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuItem asChild>
            <Link
              href={ROUTES.AGREEMENT.INVITE}
              className="flex items-center gap-2"
            >
              <Handshake className="h-4 w-4" />
              Agreement
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Warning indicator when limits are near or hit */}
      {limits && (
        <Dialog>
          <DialogTrigger asChild>
            {transactionLimitHit ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 h-10 w-10"
                title="Transaction limits reached"
              >
                <AlertCircle className="h-5 w-5" />
              </Button>
            ) : (
              (limits.pending.current / limits.pending.max >= 0.8 ||
                limits.active.current / limits.active.max >= 0.8) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-amber-500 hover:bg-amber-500/10"
                  title="Approaching transaction limits"
                >
                  <AlertCircle className="h-5 w-5" />
                </Button>
              )
            )}
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Transaction Limits</DialogTitle>
              <DialogDescription>
                Your current transaction capacity usage
              </DialogDescription>
            </DialogHeader>
            <TransactionLimitsIndicator userId={user.id} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
export default HeroAction;
