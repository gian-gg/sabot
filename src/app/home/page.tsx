'use client';

import { useState } from 'react';
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
    <>
      <HeroSection />
      <div className="mt-16">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-8">
          {activeTab === 'transactions' && <TransactionsSection />}
          {activeTab === 'contracts' && <ActiveContractsSection />}
          {activeTab === 'verification' && <VerificationSection />}
        </div>
      </div>
    </>
  );
}
