import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { mockTransactions } from '@/lib/mock-data/transactions';
import { Header } from '@/components/home/header';
import { PublicLedger } from '@/components/home/public-ledger';
import { MarketplaceCarousel } from '@/components/home/marketplace-carousel';
import { getSession } from '@/lib/auth/server';
import { ShieldCheck, Github, Twitter, Mail } from 'lucide-react';

export default async function Home() {
  // Get session for auth state
  const session = await getSession();

  // Sort transactions by timestamp (newest first)
  const transactions = [...mockTransactions].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-black">
      {/* Header - Glassmorphic Navigation */}
      <Header session={session} />

      {/* Light Source Effect - Fixed at top, behind header */}
      <div className="pointer-events-none fixed -top-[200px] left-1/2 z-0 h-[350px] w-[500px] -translate-x-1/2">
        <div className="absolute top-0 left-1/2 h-[300px] w-[400px] -translate-x-1/2 rounded-full bg-white/10 blur-[100px]" />
        <div className="absolute top-[20px] left-1/2 h-[200px] w-[250px] -translate-x-1/2 rounded-full bg-white/15 blur-[70px]" />
        <div className="absolute top-[40px] left-1/2 h-[120px] w-[120px] -translate-x-1/2 rounded-full bg-white/20 blur-[40px]" />
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative flex-shrink-0 px-6 pt-24 pb-8">
          <div className="relative mx-auto max-w-[900px] text-center">
            <h1 className="mb-3 text-3xl leading-[1.2] font-bold tracking-tight text-white sm:text-4xl">
              When trust is uncertain, bring in Sabot
            </h1>
            <p className="mx-auto mb-6 max-w-[680px] text-sm leading-relaxed text-neutral-400 sm:text-base">
              Your third-party safety layer for verified, transparent, and
              scam-free online transactions.
            </p>

            {/* CTA Button */}
            <div className="flex items-center justify-center">
              <Button
                className="h-10 bg-white px-8 text-sm font-medium text-black hover:bg-neutral-100"
                asChild
              >
                <Link href={ROUTES.TRANSACTION.NEW}>Create Transaction</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Transaction Ledger Preview */}
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1100px]">
            <PublicLedger transactions={transactions} />
          </div>
        </section>

        {/* Marketplace Carousel */}
        <MarketplaceCarousel />

        {/* Footer */}
        <footer className="border-t border-neutral-800/50 bg-gradient-to-b from-black to-neutral-950">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {/* Brand Column */}
              <div className="md:col-span-1">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-white" />
                  <span className="text-lg font-semibold text-white">
                    Sabot
                  </span>
                </div>
                <p className="mb-4 text-sm text-neutral-400">
                  Your third-party safety layer for verified, transparent, and
                  scam-free online transactions.
                </p>
                <div className="flex gap-3">
                  <a
                    href={ROUTES.SOCIALS.GITHUB}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-neutral-800 p-2 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                  <a
                    href="#"
                    className="rounded-lg border border-neutral-800 p-2 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a
                    href="mailto:hello@sabot.com"
                    className="rounded-lg border border-neutral-800 p-2 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Product Column */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-white">
                  Product
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="#features"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#how-it-works"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={ROUTES.REPORTS}
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      Reports
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#pricing"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-white">
                  Company
                </h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="#about"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#blog"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#careers"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#contact"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="#privacy"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#terms"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#security"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      Security
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#compliance"
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      Compliance
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-12 border-t border-neutral-800/50 pt-8">
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-sm text-neutral-500">
                  © {new Date().getFullYear()} Sabot. All rights reserved.
                </p>
                <p className="text-sm text-neutral-500">
                  Built with ♥ for safer transactions
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
