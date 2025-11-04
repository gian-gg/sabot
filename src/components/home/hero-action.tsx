'use client';

import { ROUTES } from '@/constants/routes';
import { useUserStore } from '@/store/user/userStore';
import { BadgeCheck, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useRegisterWallet } from '@/hooks/useRegisterWallet';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Handshake } from 'lucide-react';

const HeroAction = () => {
  const user = useUserStore();

  useRegisterWallet(user.verificationStatus === 'complete');

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
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="size-4" />
            Create
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom">
          <DropdownMenuItem asChild>
            <Link href={ROUTES.TRANSACTION.INVITE}>
              <BadgeCheck />
              Transaction
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.AGREEMENT.INVITE}>
              <Handshake />
              Agreement
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
export default HeroAction;
