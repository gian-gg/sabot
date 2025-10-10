import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'sabot',
  description: '#hacktoberfest',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark antialiased">
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
