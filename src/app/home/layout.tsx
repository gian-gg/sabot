import { getSession } from '@/lib/auth/server';
import React from 'react';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants/routes';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect(ROUTES.ROOT);
  }

  return <div>{children}</div>;
}
