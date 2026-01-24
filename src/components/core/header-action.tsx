'use client';

import { usePathname } from 'next/navigation';

import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/user/userStore';
import Link from 'next/link';
import UserComponent from '../user/user-component';
import { House } from 'lucide-react';

export default function HeaderAction() {
  const user = useUserStore();
  const pathname = usePathname();

  if (!user.id) return null;

  return <UserComponent user={user} />;
}
