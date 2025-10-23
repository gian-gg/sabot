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

const HeroAction = () => {
  const user = useUserStore();

  if (user.verificationStatus === 'not-started') {
    return (
      <Button asChild>
        <Link href={ROUTES.HOME.VERIFY}>
          <BadgeCheck className="mr-2 h-4 w-4" />
          Verify Account
        </Link>
      </Button>
    );
  }

  if (user.verificationStatus === 'pending') {
    return (
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
    );
  }

  return (
    <Button asChild>
      <Link href={ROUTES.TRANSACTION.NEW}>
        <Plus className="mr-2 h-4 w-4" />
        Create Transaction
      </Link>
    </Button>
  );
};

export default HeroAction;
