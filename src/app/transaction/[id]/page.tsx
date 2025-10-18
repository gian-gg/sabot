'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockTransactions } from '@/lib/mock-data/transactions';
import { getUserById } from '@/lib/mock-data/users';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  Sparkles,
  MapPinned,
} from 'lucide-react';
import { TransactionProgress } from '@/components/transaction/id/transaction-progress';
import { TransactionCarousel } from '@/components/transaction/id/transaction-carousel';
import { ProductInfoCard } from '@/components/transaction/id/product-info';
import { SellerInfoCard } from '@/components/transaction/id/seller-info';
import { AIChangesCard } from '@/components/transaction/id/ai-changes';
import { OccurrenceDetailsCard } from '@/components/transaction/id/occurrence-details';

const aiChanges = {
  original:
    'Transaction for iPhone 14 Pro Max in excellent condition. Meetup at Central Mall. Price negotiable.',
  originalLines: [
    'Transaction for iPhone 14 Pro Max in excellent condition.',
    'Meetup at Central Mall.',
    'Price negotiable.',
    'Seller prefers cash payment.',
  ],
  modifiedLines: [
    'Transaction for iPhone 14 Pro Max in like new condition.',
    'Meetup at Central Mall, Food Court Level 2.',
    'Fixed price at $899.',
    'Digital payment accepted via platform.',
  ],
  amendments: [
    {
      field: 'Condition',
      from: 'Excellent',
      to: 'Like New',
      reason: 'More accurate based on photos',
    },
    {
      field: 'Location',
      from: 'Central Mall',
      to: 'Central Mall, Food Court Level 2',
      reason: 'User specified exact meetup point',
    },
    {
      field: 'Price',
      from: 'Negotiable',
      to: 'Fixed at $899',
      reason: 'User confirmed final price',
    },
  ],
};

export default function TransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportNotes, setReportNotes] = useState('');
  const [currentSection, setCurrentSection] = useState(0);

  const transaction = mockTransactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <div className="flex min-h-screen w-full flex-col pt-14">
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-neutral-400">
                Transaction not found
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href={ROUTES.HOME.ROOT}>Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const seller = getUserById('user-2') ?? null;

  const handleReport = () => {
    console.log('Creating report with notes:', reportNotes);
    setReportOpen(false);
    setReportNotes('');
  };

  const transactionOccurrence = {
    location: transaction.location,
    exactLocation: 'Central Mall, Food Court Level 2',
    scheduledTime: 'Dec 15, 2024 at 3:00 PM',
    actualTime:
      transaction.status === 'completed' ? 'Dec 15, 2024 at 3:15 PM' : null,
    disputes: [],
    status: transaction.status,
  };

  // --- Section Definitions ---
  const sections = [
    {
      id: 'product',
      title: 'Product Details',
      icon: Package,
      content: (
        <div className="space-y-3">
          <ProductInfoCard transaction={transaction} />
        </div>
      ),
    },
    {
      id: 'party',
      title: 'Other Party',
      icon: User,
      content: (
        <div className="space-y-3">
          <SellerInfoCard seller={seller} transaction={transaction} />
        </div>
      ),
    },
    {
      id: 'ai',
      title: 'AI Changes',
      icon: Sparkles,
      content: (
        <div className="space-y-3">
          <AIChangesCard aiChanges={aiChanges} />
        </div>
      ),
    },
    {
      id: 'occurrence',
      title: 'Transaction Details',
      icon: MapPinned,
      content: (
        <div className="space-y-3">
          <OccurrenceDetailsCard
            transactionOccurrence={transactionOccurrence}
            reportOpen={reportOpen}
            setReportOpen={setReportOpen}
            reportNotes={reportNotes}
            setReportNotes={setReportNotes}
            handleReport={handleReport}
          />
        </div>
      ),
    },
  ];

  // --- Main Render ---
  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden pt-14">
      <div className="mx-auto max-w-3xl">
        <TransactionProgress
          currentSection={currentSection}
          totalSections={sections.length}
          onSectionClick={setCurrentSection}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <TransactionCarousel
          sections={sections}
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
        />
      </div>
      <div className="border-t border-neutral-800 bg-neutral-950 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
            className="flex-1"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <div className="text-xs text-neutral-500">
            {currentSection + 1} / {sections.length}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentSection(
                Math.min(sections.length - 1, currentSection + 1)
              )
            }
            disabled={currentSection === sections.length - 1}
            className="flex-1"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
