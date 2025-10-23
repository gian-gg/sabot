'use client';

import React from 'react';
import { useUserStore } from '@/store/user/userStore';
import { Button } from '../ui/button';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { ShieldUser } from 'lucide-react';

const AdminButton = () => {
  const user = useUserStore();
  const pathname = usePathname();

  if (user.role !== 'admin' || pathname === ROUTES.ROOT) {
    return null;
  }
  return (
    <Button variant="secondary" size="sm" asChild>
      <Link href={ROUTES.ADMIN.ROOT}>
        <ShieldUser /> Admin Panel
      </Link>
    </Button>
  );
};

export default AdminButton;
