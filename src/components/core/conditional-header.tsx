'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/core/header';
import { useEffect, useState } from 'react';

export function ConditionalHeader() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Define pages/patterns where header should be hidden
  const shouldHideHeader =
    pathname === '/agreement' ||
    (pathname.includes('/agreement/') && pathname.endsWith('/active')); // Hide for agreement active pages

  // During SSR or before hydration, always render the header to match server
  if (!isClient) {
    return <Header />;
  }

  // After hydration, conditionally render based on pathname
  if (shouldHideHeader) {
    return null;
  }

  return <Header />;
}
