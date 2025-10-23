'use client';

import { usePathname } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/user/userStore';
import Link from 'next/link';
import UserComponent from '../user/user-component';
import { CirclePlus } from 'lucide-react';

export default function HeaderAction() {
  const user = useUserStore();
  const pathname = usePathname();

  if (!user.id) return null;

  if (user.id && pathname === ROUTES.ROOT) {
    return (
      <Button size="sm" asChild>
        <Link href={ROUTES.HOME.ROOT}>
          <CirclePlus />
          Create Transaction
        </Link>
      </Button>
    );
  }

  return <UserComponent user={user} />;
}
