import { ConditionalHeader } from '@/components/core/conditional-header';
import { FooterWrapper } from '@/components/core/footer-wrapper';
import { ErrorBoundary } from '@/components/error-boundary';
import { createClient } from '@/lib/supabase/server';
import { HydrateUser } from '@/store/user/hydrate-userStore';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import React from 'react';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'sabot',
  description: '#hacktoberfest #listbuilderschallenge3',
};

interface AuthUser {
  id: string;
  user_metadata: {
    avatar_url: string;
    full_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="flex min-h-screen min-w-screen flex-col justify-between antialiased">
        <HydrateUser user={user as AuthUser | null} />

        <ErrorBoundary>
          <ConditionalHeader />

          <main className="flex min-h-[600px] flex-col overflow-x-hidden">
            {children}
          </main>

          <FooterWrapper />
        </ErrorBoundary>

        <Toaster richColors theme="dark" />
      </body>
    </html>
  );
}
