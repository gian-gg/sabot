import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Header } from '@/components/core/header';
import { FooterWrapper } from '@/components/core/footer-wrapper';
import { createClient } from '@/lib/supabase/server';
import { HydrateUser } from '@/store/user/hydrate-userStore';
import React from 'react';
import SonnerToaster from '@/components/shared/sonner-toaster';

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

        <Header />

        <main className="flex min-h-[600px] flex-col overflow-x-hidden">
          {children}
        </main>

        <FooterWrapper />

        <Toaster richColors theme="dark" />
        <SonnerToaster />
      </body>
    </html>
  );
}
