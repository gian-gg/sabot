'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Plus, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useUserStore } from '@/store/user/userStore';

const HeroAction = () => {
  const user = useUserStore();

  if (!user.isVerified) {
    return (
      <Button asChild>
        <Link href={ROUTES.HOME.VERIFY}>
          <BadgeCheck className="mr-2 h-4 w-4" />
          Verify Account
        </Link>
      </Button>
    );
  }
};

export default HeroAction;
