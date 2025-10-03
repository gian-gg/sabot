'use client';

import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Settings,
  Menu,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import SignOut from '../auth/sign-out';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-border bg-card/50 sticky top-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <Sparkles className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="text-xl font-bold">FinanceAI</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Button variant="ghost" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </Button>
            <Button variant="ghost" className="gap-2">
              <Wallet className="h-4 w-4" />
              Accounts
            </Button>
            <Button variant="ghost" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <SignOut />
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="border-border border-t py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              <Button variant="ghost" className="justify-start gap-2">
                <TrendingUp className="h-4 w-4" />
                Analytics
              </Button>
              <Button variant="ghost" className="justify-start gap-2">
                <Wallet className="h-4 w-4" />
                Accounts
              </Button>
              <Button variant="ghost" className="justify-start gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
