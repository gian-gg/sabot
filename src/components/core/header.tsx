'use client';

import HeaderAction from '@/components/core/header-action';
import Logo from '@/components/core/logo';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import AdminButton from './admin-button';

export function Header() {
  const [mouseX, setMouseX] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

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
      const headerOffset = 64; // Height of the fixed header (h-16 = 64px)
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      // If section doesn't exist on current page, redirect to landing page with hash
      window.location.href = `/#${id}`;
    }
  };

  const handleMobileNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    handleSmoothScroll(e, id);
    setIsOpen(false); // Close drawer after clicking
  };

  return (
    <header className="glass fixed top-0 right-0 left-0 z-50 w-full border-none">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm md:flex">
          <Link
            href="/#features"
            onClick={(e) => handleSmoothScroll(e, 'features')}
            className="hover:text-primary font-medium text-neutral-400 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#how-it-works"
            onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
            className="hover:text-primary font-medium text-neutral-400 transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/#reports"
            onClick={(e) => handleSmoothScroll(e, 'reports')}
            className="hover:text-primary font-medium text-neutral-400 transition-colors"
          >
            Reports
          </Link>
          <Link
            href="/#tokens"
            onClick={(e) => handleSmoothScroll(e, 'tokens')}
            className="hover:text-primary font-medium text-neutral-400 transition-colors"
          >
            Tokens
          </Link>
        </nav>

        {/* Right: Mobile Menu + Actions */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[320px] flex-col sm:w-[380px]"
            >
              <SheetHeader className="border-b border-neutral-800/50 pb-5">
                <SheetTitle className="text-left text-xl font-bold">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-2 flex flex-1 flex-col">
                <Link
                  href="/#features"
                  onClick={(e) => handleMobileNavClick(e, 'features')}
                  className="hover:text-primary border-b border-neutral-800/30 px-4 py-5 text-lg font-medium text-white transition-all hover:bg-neutral-900/50"
                >
                  Features
                </Link>
                <Link
                  href="/#how-it-works"
                  onClick={(e) => handleMobileNavClick(e, 'how-it-works')}
                  className="hover:text-primary border-b border-neutral-800/30 px-4 py-5 text-lg font-medium text-white transition-all hover:bg-neutral-900/50"
                >
                  How It Works
                </Link>
                <Link
                  href="/#reports"
                  onClick={(e) => handleMobileNavClick(e, 'reports')}
                  className="hover:text-primary border-b border-neutral-800/30 px-4 py-5 text-lg font-medium text-white transition-all hover:bg-neutral-900/50"
                >
                  Reports
                </Link>
                <Link
                  href="/#tokens"
                  onClick={(e) => handleMobileNavClick(e, 'tokens')}
                  className="hover:text-primary px-4 py-5 text-lg font-medium text-white transition-all hover:bg-neutral-900/50"
                >
                  Tokens
                </Link>
              </nav>

              {/* Footer with Logo */}
              <div className="mt-auto border-t border-neutral-800/50 pt-6 pb-2">
                <div className="flex items-center justify-center opacity-50">
                  <Logo />
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <AdminButton />
          <HeaderAction />
        </div>
      </div>

      {/* Enhanced Mouse-Reactive Border with Primary Green */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-px"
        style={{
          background: `linear-gradient(90deg,
            rgba(1, 208, 108, 0.1) 0%,
            rgba(1, 208, 108, 0.2) ${Math.max(0, mouseX - 200)}px,
            rgba(1, 208, 108, 0.5) ${Math.max(0, mouseX - 100)}px,
            rgba(1, 208, 108, 1) ${mouseX}px,
            rgba(1, 208, 108, 0.5) ${mouseX + 100}px,
            rgba(1, 208, 108, 0.2) ${mouseX + 200}px,
            rgba(1, 208, 108, 0.1) 100%
          )`,
          transition: 'background 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </header>
  );
}
