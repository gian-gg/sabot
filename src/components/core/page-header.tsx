import React from 'react';
import { BackButton } from './back-button';

interface PageHeaderProps {
  showBackButton?: boolean;
  backButtonFallback?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  showBackButton = true,
  backButtonFallback = '/',
  children,
}: PageHeaderProps) {
  return (
    <header className="shrink-0 border-b border-neutral-800/50 bg-black/80 px-8 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between">
        {showBackButton && <BackButton fallbackUrl={backButtonFallback} />}
        {children}
      </div>
    </header>
  );
}
