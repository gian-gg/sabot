'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

export function FooterWrapper() {
  const pathname = usePathname();
  const isAgreementPage = pathname.includes('/agreement/');

  if (isAgreementPage) {
    return null;
  }

  return <Footer />;
}
