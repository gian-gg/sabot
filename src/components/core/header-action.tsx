'use client';

import { usePathname } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import Link from 'next/link';
import UserComponent from '../user/user-component';

export default function HeaderAction() {
  const user = useUserStore();
  const pathname = usePathname();

  if (!user.id) return null;

  if (user.id && pathname === ROUTES.ROOT) {
    return (
      <Button asChild>
        <Link href={ROUTES.HOME.ROOT}>Go to Home</Link>
      </Button>
    );
  }

  return <UserComponent user={user} />;
}
