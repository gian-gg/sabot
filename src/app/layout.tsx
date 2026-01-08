import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ConditionalHeader } from '@/components/core/conditional-header';
import { FooterWrapper } from '@/components/core/footer-wrapper';
import { createClient } from '@/lib/supabase/server';
import { HydrateUser } from '@/store/user/hydrate-userStore';
import { ErrorBoundary } from '@/components/error-boundary';
import React from 'react';

export const metadata: Metadata = {
  title: 'sabot',
  description: '#hacktoberfest',
};

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
