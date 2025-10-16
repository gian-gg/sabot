'use client';

import { useState } from 'react';
import { Header } from '@/components/core/header';
import { HeroSection } from '@/components/home/hero-section';
import { TabNavigation } from '@/components/home/tab-navigation';
import { TransactionsSection } from '@/components/home/transactions-section';
import { ActiveContractsSection } from '@/components/home/active-contracts-section';
import { VerificationSection } from '@/components/home/verification-section';

export default function Page() {
  const [activeTab, setActiveTab] = useState<
    'transactions' | 'contracts' | 'verification'
  >('transactions');

  return (
    <div className="bg-background min-h-screen pt-14">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <HeroSection />
        <div className="mt-16">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="mt-8">
            {activeTab === 'transactions' && <TransactionsSection />}
            {activeTab === 'contracts' && <ActiveContractsSection />}
            {activeTab === 'verification' && <VerificationSection />}
          </div>
        </div>
      </main>
    </div>
  );
}
