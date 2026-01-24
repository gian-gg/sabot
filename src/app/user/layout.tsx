import { createClient } from '@/lib/supabase/server';
import React from 'react';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getUserVerificationData } from '@/lib/supabase/db/user';
import { HydrateUser } from '@/store/user/hydrate-userStore';
import type { UserVerificationData } from '@/types/user';

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

  let userVerificationData: UserVerificationData = {
    verification_status: 'not-started',
    role: 'user',
  };
  if (user?.id) {
    userVerificationData = await getUserVerificationData(user.id);
  }

  return (
    <>
      <HydrateUser userVerificationData={userVerificationData} />
      <div className="container mx-auto mt-20 h-full w-full px-4 py-8">
        {children}
      </div>
    </>
  );
}
