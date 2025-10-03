import { Header } from '@/components/wallet/header';
import { AiInput } from '@/components/wallet/ai-input';
import { FinancialOverview } from '@/components/wallet/financial-overview';
import { RecentTransactions } from '@/components/wallet/recent-transactions';
import { QuickActions } from '@/components/wallet/quick-actions';

export default function Wallet() {
  return (
    <div className="bg-background min-h-screen">
      <Header />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Hero Section with AI Input */}
        <section className="mb-12">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-balance md:text-5xl lg:text-6xl">
              Your AI-Powered
              <span className="text-primary"> Finance Assistant</span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-pretty md:text-xl">
              Ask anything about your finances. Track expenses, analyze
              spending, and get intelligent insights.
            </p>
          </div>

          <AiInput />
        </section>

        {/* Financial Overview */}
        <FinancialOverview />

        {/* Quick Actions */}
        <QuickActions />

        {/* Recent Transactions */}
        <RecentTransactions />
      </main>
    </div>
  );
}
