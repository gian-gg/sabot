import { getSession } from '@/lib/auth/server';
import React from 'react';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/');
  }
  return <div>{children}</div>;
}
