import { createClient } from '@/lib/supabase/server';
import React from 'react';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { isUserVerified } from '@/lib/supabase/db/user';
import { HydrateUser } from '@/store/user/hydrate-userStore';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.ROOT);
  }

  let isVerified = false;
  if (user?.id) {
    isVerified = await isUserVerified(user.id);
  }

  return (
    <>
      <HydrateUser isVerified={isVerified} />
      <div className="container mx-auto mt-20 h-full w-full px-4 py-8">
        {children}
      </div>
    </>
  );
}
