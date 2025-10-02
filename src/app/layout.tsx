import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'jiji',
  description: 'Yet another finance app, this time with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
