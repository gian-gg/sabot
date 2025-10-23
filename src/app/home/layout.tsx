import { createClient } from '@/lib/supabase/server';
import React from 'react';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getUserVerificationStatus } from '@/lib/supabase/db/user';
import { HydrateUser } from '@/store/user/hydrate-userStore';
import { VerificationStatus } from '@/types/user';

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

  let verificationStatus: VerificationStatus = 'not-started';
  if (user?.id) {
    verificationStatus = await getUserVerificationStatus(user.id);
  }

  return (
    <>
      <HydrateUser verificationStatus={verificationStatus} />
      <div className="container mx-auto mt-20 h-full w-full px-4 py-8">
        {children}
      </div>
    </>
  );
}
