'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  User,
  Sparkles,
  MapPinned,
  Scan,
} from 'lucide-react';
import { StepIndicator } from '@/components/verify/components/step-indicator';
import { TransactionCarousel } from '@/components/transaction/id/transaction-carousel';
import { ProductInfoCard } from '@/components/transaction/id/product-info';
import { SellerInfoCard } from '@/components/transaction/id/seller-info';
import { AIChangesCard } from '@/components/transaction/id/ai-changes';
import { OccurrenceDetailsCard } from '@/components/transaction/id/occurrence-details';
import { ScreenshotAnalysis } from '@/components/transaction/id/screenshot-analysis';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';

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

  // Use real data instead of mock data
  const { status, loading, error } = useTransactionStatus(id);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col pt-14">
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-neutral-400">Loading transaction...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col pt-14">
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-neutral-400">
                  Error loading transaction: {error}
                </p>
                <Button asChild className="mt-4 w-full">
                  <Link href={ROUTES.HOME.ROOT}>Go Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const transaction = status?.transaction;

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

  // Transform real data to match expected format
  const transformedTransaction = {
    id: transaction.id,
    type: 'other' as const, // Map from real data or add to DB
    buyerName:
      status.participants.find((p) => p.role === 'invitee')?.user_id ||
      'Unknown Buyer',
    sellerName:
      status.participants.find((p) => p.role === 'creator')?.user_id ||
      'Unknown Seller',
    price: transaction.price || 0,
    currency: 'USD', // Add to DB schema if needed
    status: transaction.status,
    method: 'meetup' as const, // Map from real data
    location: transaction.meeting_location || 'Location not set',
    timestamp: new Date(transaction.created_at),
    platform: undefined,
  };

  // Get seller from real participants data
  const seller = status.participants.find((p) => p.role === 'creator')
    ? {
        id: status.participants.find((p) => p.role === 'creator')!.user_id,
        name:
          status.participants.find((p) => p.role === 'creator')!.user_id ||
          'Unknown',
        avatar: undefined, // Add to participants if needed
        trustScore: 85, // Add to user profile
        isVerified: true, // Add verification status
        completedTransactions: 10, // Add to user profile
      }
    : null;

  const handleReport = () => {
    console.log('Creating report with notes:', reportNotes);
    setReportOpen(false);
    setReportNotes('');
  };

  const transactionOccurrence = {
    location: transformedTransaction.location,
    exactLocation: 'Central Mall, Food Court Level 2',
    scheduledTime: 'Dec 15, 2024 at 3:00 PM',
    actualTime:
      transformedTransaction.status === 'completed'
        ? 'Dec 15, 2024 at 3:15 PM'
        : null,
    disputes: [],
    status: transformedTransaction.status,
  };

  // --- Section Definitions ---
  const sections = [
    {
      id: 'product',
      title: 'Product Details',
      icon: Package,
      content: (
        <div className="space-y-3">
          <ProductInfoCard transaction={transformedTransaction} />
        </div>
      ),
    },
    {
      id: 'party',
      title: 'Other Party',
      icon: User,
      content: (
        <div className="space-y-3">
          <SellerInfoCard
            seller={seller}
            transaction={transformedTransaction}
          />
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
      id: 'analysis',
      title: 'AI Analysis',
      icon: Scan,
      content: (
        <div className="space-y-3">
          <ScreenshotAnalysis
            transactionId={id}
            currentUserId={transformedTransaction.buyerName}
          />
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
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 container mx-auto max-w-2xl py-8 pt-20 duration-200">
      <h1 className="mb-6 text-center text-2xl font-bold md:mb-8 md:text-3xl">
        Transaction Summary
      </h1>
      <StepIndicator
        steps={sections.map((s) => s.title)}
        currentStep={currentSection}
      />

      <div className="animate-in fade-in-0 mt-6 duration-200 md:mt-8">
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
