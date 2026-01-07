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
import {
  getAgreementLimitsStatus,
  type AgreementLimitsStatus,
} from '@/lib/supabase/db/agreements';
import { TransactionLimitsIndicator } from './components/transactions/transaction-limits-indicator';
import { AgreementLimitsIndicator } from './components/agreement/agreement-limits-indicator';

const HeroAction = () => {
  const user = useUserStore();
  const [limits, setLimits] = useState<TransactionLimitsStatus | null>(null);
  const [agreementLimits, setAgreementLimits] =
    useState<AgreementLimitsStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useRegisterWallet(user.verificationStatus === 'complete');

  // Fetch transaction and agreement limits
  useEffect(() => {
    if (user.id && user.verificationStatus === 'complete') {
      Promise.all([
        getTransactionLimitsStatus(user.id),
        getAgreementLimitsStatus(user.id),
      ])
        .then(([transactionLimits, agrmtLimits]) => {
          setLimits(transactionLimits);
          setAgreementLimits(agrmtLimits);
        })
        .catch((error) => {
          console.error('Failed to fetch limits:', error);
          setLimits(null);
          setAgreementLimits(null);
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

  // Determine if agreement creation is disabled
  const agreementDisabled =
    !agreementLimits || !agreementLimits.canCreateAgreement || loading;
  const agreementLimitHit =
    agreementLimits && !agreementLimits.canCreateAgreement;

  let limitTooltip = '';
  if (transactionLimitHit) {
    const pendingHit = !limits!.pending.canCreate;
    const activeHit = !limits!.active.canCreate;

    if (pendingHit && activeHit) {
      limitTooltip = `Pending limit reached (${limits!.pending.current}/${limits!.pending.max}) and Active limit reached (${limits!.active.current}/${limits!.active.max})`;
    } else if (pendingHit) {
      limitTooltip = `Pending transaction limit reached (${limits!.pending.current}/${limits!.pending.max}). Delete or complete some transactions.`;
    } else if (activeHit) {
      limitTooltip = `Active transaction limit reached (${limits!.active.current}/${limits!.active.max}). Complete or cancel some transactions.`;
    }
  }

  let agreementLimitTooltip = '';
  if (agreementLimitHit) {
    const waitingHit = !agreementLimits!.waiting.canCreate;
    const inProgressHit = !agreementLimits!.inProgress.canCreate;

    if (waitingHit && inProgressHit) {
      agreementLimitTooltip = `Waiting limit reached (${agreementLimits!.waiting.current}/${agreementLimits!.waiting.max}) and In-progress limit reached (${agreementLimits!.inProgress.current}/${agreementLimits!.inProgress.max})`;
    } else if (waitingHit) {
      agreementLimitTooltip = `Waiting agreement limit reached (${agreementLimits!.waiting.current}/${agreementLimits!.waiting.max}). Complete some agreements.`;
    } else if (inProgressHit) {
      agreementLimitTooltip = `In-progress agreement limit reached (${agreementLimits!.inProgress.current}/${agreementLimits!.inProgress.max}). Finalize some agreements.`;
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

          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  disabled={agreementDisabled}
                  asChild={!agreementDisabled}
                >
                  {!agreementDisabled ? (
                    <Link
                      href={ROUTES.AGREEMENT.INVITE}
                      className="flex items-center gap-2"
                    >
                      <Handshake className="h-4 w-4" />
                      <span>Agreement</span>
                      {agreementLimits && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          (
                          {agreementLimits.waiting.current +
                            agreementLimits.inProgress.current}
                          /5)
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Handshake className="h-4 w-4" />
                      <span>Agreement</span>
                      {agreementLimits && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          (
                          {agreementLimits.waiting.current +
                            agreementLimits.inProgress.current}
                          /5)
                        </span>
                      )}
                    </div>
                  )}
                </DropdownMenuItem>
              </TooltipTrigger>
              {agreementLimitHit && (
                <TooltipContent side="right" className="max-w-xs">
                  <p>{agreementLimitTooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Warning indicator when limits are near or hit */}
      {(limits || agreementLimits) && (
        <Dialog>
          <DialogTrigger asChild>
            {transactionLimitHit || agreementLimitHit ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 h-10 w-10"
                title="Limits reached"
              >
                <AlertCircle className="h-5 w-5" />
              </Button>
            ) : (
              ((limits &&
                (limits.pending.current / limits.pending.max >= 0.8 ||
                  limits.active.current / limits.active.max >= 0.8)) ||
                (agreementLimits &&
                  (agreementLimits.waiting.current /
                    agreementLimits.waiting.max >=
                    0.8 ||
                    agreementLimits.inProgress.current /
                      agreementLimits.inProgress.max >=
                      0.8))) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-amber-500 hover:bg-amber-500/10"
                  title="Approaching limits"
                >
                  <AlertCircle className="h-5 w-5" />
                </Button>
              )
            )}
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Usage Limits</DialogTitle>
              <DialogDescription>Your current capacity usage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {limits && <TransactionLimitsIndicator userId={user.id} />}
              {agreementLimits && <AgreementLimitsIndicator userId={user.id} />}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
export default HeroAction;
