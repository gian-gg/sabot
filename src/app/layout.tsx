import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Header } from '@/components/home/header';
import Footer from '@/components/home/footer';
import { getSession } from '@/lib/auth/server';

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
        <Header
          user={{
            name: session?.user?.name || '',
            email: session?.user?.email || '',
            avatar: session?.user?.image || '',
          }}
        />

        <main className="mt-20 flex min-h-[600px] flex-col overflow-x-hidden">
          {children}
        </main>

        <Footer />

        <Toaster richColors />
      </body>
    </html>
  );
}
