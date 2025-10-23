'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Plus, BadgeCheck, Clock } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useUserStore } from '@/store/user/userStore';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useRegisterWallet } from '@/hooks/useRegisterWallet';

const HeroAction = () => {
  const user = useUserStore();

  const isVerified =
    user.verificationStatus !== 'not-started' &&
    user.verificationStatus !== 'pending';
  useRegisterWallet(isVerified);
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
      <Tooltip>
               {' '}
        <TooltipTrigger asChild>
                   {' '}
          <Button>
                        <Clock className="mr-2 h-4 w-4" />            Pending
            Verification          {' '}
          </Button>
                 {' '}
        </TooltipTrigger>
               {' '}
        <TooltipContent align="center" side="right">
                    <p>Verifying account, kindly check again later.</p>     
           {' '}
        </TooltipContent>
             {' '}
      </Tooltip>
    );
  }

  return (
    <Button asChild>
      <Link href={ROUTES.TRANSACTION.INVITE} className="flex items-center">
        <Plus className="mr-2 h-4 w-4" />
        <span>Create Transaction</span>
      </Link>
    </Button>
  );
};
export default HeroAction;
