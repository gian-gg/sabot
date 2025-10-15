import React from 'react';
import { mockTransactions } from '@/lib/mock-data/transactions';
import { PublicLedger } from '@/components/home/public-ledger';
import { MarketplaceCarousel } from '@/components/home/marketplace-carousel';
import GetStartedButton from '@/components/user/get-started-button';

export default async function Home() {
  // Sort transactions by timestamp (newest first)
  const transactions = [...mockTransactions].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <>
      {/* Light Source Effect - Fixed at top, behind header */}
      <div className="pointer-events-none fixed -top-[200px] left-1/2 z-0 h-[350px] w-[500px] -translate-x-1/2">
        <div className="absolute top-0 left-1/2 h-[300px] w-[400px] -translate-x-1/2 rounded-full bg-white/10 blur-[100px]" />
        <div className="absolute top-[20px] left-1/2 h-[200px] w-[250px] -translate-x-1/2 rounded-full bg-white/15 blur-[70px]" />
        <div className="absolute top-[40px] left-1/2 h-[120px] w-[120px] -translate-x-1/2 rounded-full bg-white/20 blur-[40px]" />
      </div>

      {/* Main Content - Scrollable with top padding for fixed header */}
      <div className="flex flex-col gap-20 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative flex-shrink-0 px-6 pt-24 pb-8">
          <div className="relative mx-auto max-w-[500px] text-center">
            <h1 className="mb-3 leading-[1.2] font-medium tracking-tight text-white sm:text-5xl">
              When trust is uncertain, bring in Sabot
            </h1>
            {/* <p className="mx-auto mb-6 max-w-[680px] text-sm leading-relaxed text-neutral-400 sm:text-base">
              Your third-party safety layer for verified, transparent, and
              scam-free online transactions.
            </p> */}
            <p className="mx-auto mb-6 max-w-[680px] text-sm leading-relaxed text-neutral-400 sm:text-base">
              Your third-party safety layer transparent transactions.
            </p>

            {/* CTA Button */}
            <div className="flex items-center justify-center">
              <GetStartedButton />
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
      </div>
    </>
  );
}
