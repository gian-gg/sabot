'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Plus, BadgeCheck, Clock } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useUserStore } from '@/store/user/userStore';
import { useRouter } from 'next/navigation';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useRegisterWallet } from '@/hooks/useRegisterWallet';

const HeroAction = () => {
  const user = useUserStore();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const createRef = useRef<HTMLDivElement>(null);

  const goToTransactionNew = () => {
    router.push(ROUTES.TRANSACTION.INVITE);
    setCreateOpen(false);
  };

  const goToAgreementNew = () => {
    router.push(ROUTES.AGREEMENT.INVITE);
    setCreateOpen(false);
  };

  const goToTutorial = () => {
    router.push(ROUTES.TUTORIAL);
    setCreateOpen(false);
  };

  if (user.verificationStatus === 'not-started') {
    return (
      <Button asChild>
        <Link href={ROUTES.HOME.VERIFY} className="flex items-center">
          <BadgeCheck className="mr-2 h-4 w-4" />
          <span>Verify Account</span>
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

  return (
    <div ref={createRef} className="relative">
      <button
        type="button"
        onClick={() => setCreateOpen((v) => !v)}
        className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-900"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Transaction
      </button>
      {createOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-md border bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <button
            onClick={goToTransactionNew}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            Transaction
          </button>
          <button
            onClick={goToAgreementNew}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            Agreement
          </button>
          <button
            onClick={goToTutorial}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-zinc-800"
          >
            Tutorial
          </button>
        </div>
      )}
    </div>
  );
};
export default HeroAction;
