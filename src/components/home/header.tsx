'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import UserComponent from '@/components/user/user-component';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const [mouseX, setMouseX] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <header className="glass fixed top-0 right-0 left-0 z-50 w-full">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand with Icon */}
        <div className="flex w-full items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-white" />
            <Link href={ROUTES.ROOT}>
              <h1 className="text-base font-semibold tracking-tight text-white transition-opacity hover:opacity-100">
                Sabot
              </h1>
            </Link>
          </div>
          {pathname.startsWith(ROUTES.HOME.ROOT) && <UserComponent />}
        </div>
      </div>

      {/* Mouse-Reactive Border */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg,
            rgba(255,255,255,0.1) 0%,
            rgba(255,255,255,0.1) ${Math.max(0, mouseX - 150)}px,
            rgba(255,255,255,0.6) ${Math.max(0, mouseX - 50)}px,
            rgba(255,255,255,1) ${mouseX}px,
            rgba(255,255,255,0.6) ${mouseX + 50}px,
            rgba(255,255,255,0.1) ${mouseX + 150}px,
            rgba(255,255,255,0.1) 100%
          )`,
          transition: 'background 100ms ease-out',
        }}
      />
    </header>
  );
}
