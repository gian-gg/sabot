'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HeaderAction from '@/components/core/header-action';
import Logo from '@/components/core/logo';
import AdminButton from './admin-button';

export function Header() {
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

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 56; // Height of the fixed header (h-14 = 56px)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header className="glass fixed top-0 right-0 left-0 z-50 w-full border-none">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand with Icon */}
        <div className="flex w-full items-center justify-between gap-2.5">
          <div className="flex items-center gap-16">
            <Logo />
            {/* Navigation Links */}
            <nav className="hidden items-center gap-6 text-sm md:flex">
              <Link
                href="/#features"
                onClick={(e) => handleSmoothScroll(e, 'features')}
                className="text-neutral-400 transition-colors hover:text-white"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                className="text-neutral-400 transition-colors hover:text-white"
              >
                How It Works
              </Link>
              <Link
                href="/#reports"
                onClick={(e) => handleSmoothScroll(e, 'reports')}
                className="text-neutral-400 transition-colors hover:text-white"
              >
                Reports
              </Link>
              <Link
                href="/#tokens"
                onClick={(e) => handleSmoothScroll(e, 'tokens')}
                className="text-neutral-400 transition-colors hover:text-white"
              >
                Tokens
              </Link>
              <Link
                href="/#docs"
                onClick={(e) => handleSmoothScroll(e, 'docs')}
                className="text-neutral-400 transition-colors hover:text-white"
              >
                Docs
              </Link>
            </nav>
          </div>

          <div className="flex gap-4">
            <AdminButton />
            <HeaderAction />
          </div>
        </div>
      </div>

      {/* Mouse-Reactive Border */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-px"
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
