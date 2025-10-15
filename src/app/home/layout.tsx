import { createClient } from '@/lib/supabase/server';
import React from 'react';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/constants/routes';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(ROUTES.ROOT);
  }

  return <div className="h-full w-full">{children}</div>;
}
