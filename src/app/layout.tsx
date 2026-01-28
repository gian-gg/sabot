import { ConditionalHeader } from '@/components/core/conditional-header';
import { FooterWrapper } from '@/components/core/footer-wrapper';
import { ErrorBoundary } from '@/components/error-boundary';
import { createClient } from '@/lib/supabase/server';
import { HydrateUser } from '@/store/user/hydrate-userStore';
import '@/styles/globals.css';
import type { Metadata } from 'next';
import type { AuthUser } from '@/types';
import React from 'react';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: {
    default: 'Sabot',
    template: '%s | Sabot',
  },
  description:
    'A composable platform for peer-to-peer transaction verification. Sabot ensures verified, transparent, and scam-free online transactions with AI-powered fraud detection and blockchain escrow.',
  applicationName: 'Sabot',
  authors: [{ name: 'Untitled' }, { name: 'Untitled' }],
  generator: 'Next.js',
  keywords: [
    'escrow',
    'transaction verification',
    'fraud detection',
    'peer-to-peer',
    'blockchain',
    'marketplace',
    'safety',
    'ai',
    'smart contracts',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Sabot Team',
  publisher: 'Sabot',
  metadataBase: new URL('https://www.sabotchain.com'), // Replace with actual production URL if different
  openGraph: {
    title: 'Sabot | Secure Peer-to-Peer Transactions',
    description:
      'Verified, transparent, and scam-free online transactions. Features AI-powered fraud detection, identity verification, and blockchain-backed escrow.',
    url: 'https://www.sabotchain.com',
    siteName: 'Sabot',
    images: [
      {
        url: '/sabot-opengraph.png',
        width: 1200,
        height: 630,
        alt: 'Sabot - Secure Peer-to-Peer Transactions',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sabot | Secure P2P Transactions',
    description:
      'The safety layer for online marketplaces. AI fraud detection & blockchain escrow.',
    images: ['/sabot-opengraph.png'],
    creator: '@sabotchain',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
