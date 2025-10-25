'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/home/hero-section';
import { TabNavigation } from '@/components/home/tab-navigation';
import { TransactionsSection } from '@/components/home/transactions-section';
import { ActiveContractsSection } from '@/components/home/active-contracts-section';
import { GasFeeWarningDialog } from '@/components/home/gas-fee-warning-dialog';
import { useUserStore } from '@/store/user/userStore';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Page() {
  const user = useUserStore();

  const [activeTab, setActiveTab] = useState<'transactions' | 'contracts'>(
    'transactions'
  );

  return (
    <>
      <GasFeeWarningDialog />
      <HeroSection />

      <div className="mt-16">
        {user.verificationStatus === 'complete' ? (
          <>
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="mt-8">
              {activeTab === 'transactions' && <TransactionsSection />}
              {activeTab === 'contracts' && <ActiveContractsSection />}
            </div>
          </>
        ) : (
          <Alert className="border-primary/30 from-primary/10 border-2 border-dashed bg-linear-to-br to-transparent p-4">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <AlertTitle>Complete verification</AlertTitle>
            <AlertDescription>
              Verify your identity to unlock full access to transactions and
              contracts.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
}
