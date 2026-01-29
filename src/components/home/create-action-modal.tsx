'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BadgeCheck, Handshake, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TransactionLimitsStatus } from '@/lib/supabase/db/transactions';
import type { AgreementLimitsStatus } from '@/lib/supabase/db/agreements';

interface CreateActionModalProps {
  limits: TransactionLimitsStatus | null;
  agreementLimits: AgreementLimitsStatus | null;
  loading: boolean;
  children?: React.ReactNode;
}

export function CreateActionModal({
  limits,
  agreementLimits,
  loading,
  children,
}: CreateActionModalProps) {
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
      limitTooltip = `Pending transaction limit reached (${limits!.pending.current}/${limits!.pending.max}).`;
    } else if (activeHit) {
      limitTooltip = `Active transaction limit reached (${limits!.active.current}/${limits!.active.max}).`;
    }
  }

  let agreementLimitTooltip = '';
  if (agreementLimitHit) {
    const waitingHit = !agreementLimits!.waiting.canCreate;
    const inProgressHit = !agreementLimits!.inProgress.canCreate;

    if (waitingHit && inProgressHit) {
      agreementLimitTooltip = `Waiting limit reached (${agreementLimits!.waiting.current}/${agreementLimits!.waiting.max}) and In-progress limit reached (${agreementLimits!.inProgress.current}/${agreementLimits!.inProgress.max})`;
    } else if (waitingHit) {
      agreementLimitTooltip = `Waiting agreement limit reached (${agreementLimits!.waiting.current}/${agreementLimits!.waiting.max}).`;
    } else if (inProgressHit) {
      agreementLimitTooltip = `In-progress agreement limit reached (${agreementLimits!.inProgress.current}/${agreementLimits!.inProgress.max}).`;
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button disabled={transactionDisabled && agreementDisabled}>
            <Plus className="mr-2 size-4" />
            Create New
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="overflow-hidden border-neutral-800 bg-black/95 sm:max-w-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold tracking-tight text-white">
            Create New
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Choose how you want to transact securely on Sabot.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Transaction Option */}
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="relative h-full">
                  <Link
                    href={transactionDisabled ? '#' : ROUTES.TRANSACTION.INVITE}
                    className={`block h-full ${
                      transactionDisabled ? 'pointer-events-none' : ''
                    }`}
                  >
                    <Card
                      className={`group relative flex h-full flex-col justify-between overflow-hidden border-neutral-800 bg-neutral-900/40 p-4 transition-all duration-300 sm:p-6 ${
                        transactionDisabled
                          ? 'opacity-50'
                          : 'hover:border-primary/50 hover:shadow-primary/10 cursor-pointer hover:bg-neutral-900/80 hover:shadow-2xl'
                      }`}
                    >
                      <div className="mb-4 sm:mb-6">
                        <div className="bg-primary/10 text-primary ring-primary/20 group-hover:bg-primary/20 mb-3 flex size-10 items-center justify-center rounded-xl ring-1 transition-all group-hover:scale-110 sm:mb-4 sm:size-12">
                          <BadgeCheck className="size-5 sm:size-6" />
                        </div>
                        <h3 className="group-hover:text-primary mb-1 text-base font-bold text-white transition-colors sm:mb-2 sm:text-lg">
                          Transaction
                        </h3>
                        <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
                          Create a secure, escrow-backed transaction for buying
                          or selling items with fraud protection.
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-800/50 pt-3 sm:pt-4">
                        {limits ? (
                          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                            <span
                              className={
                                limits.pending.current >= limits.pending.max
                                  ? 'text-amber-500'
                                  : 'text-primary'
                              }
                            >
                              {limits.pending.current}/{limits.pending.max}
                            </span>
                            <span>Pending</span>
                          </div>
                        ) : (
                          <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
                        )}
                        <ArrowRight className="group-hover:text-primary size-4 text-neutral-600 transition-all duration-300 group-hover:translate-x-1" />
                      </div>
                    </Card>
                  </Link>
                </div>
              </TooltipTrigger>
              {transactionLimitHit && (
                <TooltipContent>
                  <p>{limitTooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Agreement Option */}
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="relative h-full">
                  <Link
                    href={agreementDisabled ? '#' : ROUTES.AGREEMENT.INVITE}
                    className={`block h-full ${
                      agreementDisabled ? 'pointer-events-none' : ''
                    }`}
                  >
                    <Card
                      className={`group relative flex h-full flex-col justify-between overflow-hidden border-neutral-800 bg-neutral-900/40 p-4 transition-all duration-300 sm:p-6 ${
                        agreementDisabled
                          ? 'opacity-50'
                          : 'cursor-pointer hover:border-purple-500/50 hover:bg-neutral-900/80 hover:shadow-2xl hover:shadow-purple-500/10'
                      }`}
                    >
                      <div className="mb-4 sm:mb-6">
                        <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20 transition-all group-hover:scale-110 group-hover:bg-purple-500/20 sm:mb-4 sm:size-12">
                          <Handshake className="size-5 sm:size-6" />
                        </div>
                        <h3 className="mb-1 text-base font-bold text-white transition-colors group-hover:text-purple-500 sm:mb-2 sm:text-lg">
                          Agreement
                        </h3>
                        <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
                          Draft a formal service contract or partnership
                          agreement with clear terms and milestones.
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-800/50 pt-3 sm:pt-4">
                        {agreementLimits ? (
                          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                            <span
                              className={
                                agreementLimits.waiting.current +
                                  agreementLimits.inProgress.current >=
                                5
                                  ? 'text-amber-500'
                                  : 'text-purple-500'
                              }
                            >
                              {agreementLimits.waiting.current +
                                agreementLimits.inProgress.current}
                              /5
                            </span>
                            <span>Active</span>
                          </div>
                        ) : (
                          <div className="h-4 w-16 animate-pulse rounded bg-neutral-800" />
                        )}
                        <ArrowRight className="size-4 text-neutral-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-500" />
                      </div>
                    </Card>
                  </Link>
                </div>
              </TooltipTrigger>
              {agreementLimitHit && (
                <TooltipContent>
                  <p>{agreementLimitTooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
