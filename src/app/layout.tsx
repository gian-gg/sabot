import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Header } from '@/components/home/header';
import Footer from '@/components/home/footer';
import { getSession } from '@/lib/auth/server';
import { HydrateUser } from '@/components/user/hydrate-userStore';

export const metadata: Metadata = {
  title: 'sabot',
  description: '#hacktoberfest',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className="dark flex min-h-screen min-w-screen flex-col justify-between antialiased">
        <HydrateUser user={session?.user as User} />

        <Header />

        <main className="flex min-h-[600px] flex-col overflow-x-hidden pt-7">
          {children}
        </main>

        <Footer />

        <Toaster richColors />
      </body>
    </html>
  );
}
