import React from 'react';
import Link from 'next/link';
import { ShieldCheck, User, LogOut } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import SignoutButton from '@/components/auth/signout-button';

interface HeaderProps {
  session: {
    user: {
      name: string;
      email: string;
      id?: string;
    };
  } | null;
}

export function Header({ session }: HeaderProps) {
  return (
    <header className="glass relative sticky top-0 z-50 border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        {/* Brand with Icon */}
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-white" />
          <Link href={ROUTES.ROOT}>
            <h1 className="text-xl font-semibold tracking-tight text-white transition-opacity hover:opacity-100">
              Sabot
            </h1>
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link href={ROUTES.PROFILE.VIEW(session.user.id || 'user-1')}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
                >
                  <User className="mr-2 h-4 w-4" />
                  {session.user.name}
                </Button>
              </Link>
              <SignoutButton />
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href={ROUTES.AUTH.SIGN_IN}>
                <LogOut className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
