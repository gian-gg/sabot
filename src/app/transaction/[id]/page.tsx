'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerificationBadge } from '@/components/user/verification-badge';
import { mockTransactions } from '@/lib/mock-data/transactions';
import { getUserById } from '@/lib/mock-data/users';
import {
  MapPin,
  AlertCircle,
  CheckCircle,
  Flag,
  ChevronLeft,
  ChevronRight,
  Info,
  Clock,
  Package,
  User,
  Sparkles,
  MapPinned,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { TransactionProgress } from '@/components/transaction-progress';
import { TransactionCarousel } from '@/components/transaction-carousel';

interface TransactionPageProps {
  params: Promise<{ id: string }>;
}

export default function TransactionPage({ params }: TransactionPageProps) {
  const { id } = use(params);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportNotes, setReportNotes] = useState('');
  const [currentSection, setCurrentSection] = useState(0);
  const [specsOpen, setSpecsOpen] = useState(false);

  const transaction = mockTransactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <div className="flex h-screen w-screen flex-col">
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

  const buyer = getUserById('user-1');
  const seller = getUserById('user-2');

  const handleReport = () => {
    console.log('Creating report with notes:', reportNotes);
    setReportOpen(false);
    setReportNotes('');
  };

  const productDetails = {
    type: 'Smartphone',
    model: 'iPhone 14 Pro Max',
    condition: 'Like New',
    specs: {
      storage: '256GB',
      color: 'Deep Purple',
      battery: '98% health',
      warranty: 'AppleCare+ until Dec 2024',
    },
  };

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

  const transactionOccurrence = {
    location: transaction.location,
    exactLocation: 'Central Mall, Food Court Level 2',
    scheduledTime: 'Dec 15, 2024 at 3:00 PM',
    actualTime:
      transaction.status === 'completed' ? 'Dec 15, 2024 at 3:15 PM' : null,
    disputes: [],
    status: transaction.status,
  };

  const sections = [
    {
      id: 'product',
      title: 'Product Details',
      icon: Package,
      content: (
        <div className="space-y-3">
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <Package className="h-4 w-4" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-neutral-500">Type</p>
                  <p className="text-sm font-medium text-white">
                    {productDetails.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Model</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-white">
                      {productDetails.model}
                    </p>
                    <Dialog open={specsOpen} onOpenChange={setSpecsOpen}>
                      <DialogTrigger asChild>
                        <button className="text-blue-400 hover:text-blue-300">
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="border-neutral-800 bg-neutral-900">
                        <DialogHeader>
                          <DialogTitle className="text-white">
                            Product Specifications
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 py-4">
                          {Object.entries(productDetails.specs).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center justify-between border-b border-neutral-800 py-2"
                              >
                                <span className="text-sm text-neutral-400 capitalize">
                                  {key}
                                </span>
                                <span className="text-sm font-medium text-white">
                                  {value}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Condition</p>
                  <Badge
                    variant="secondary"
                    className="mt-1 border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                  >
                    {productDetails.condition}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Price</p>
                  <p className="text-sm font-medium text-white">
                    {transaction.currency}
                    {transaction.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-white">
                Transaction Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-white">
                    {transaction.method === 'meetup'
                      ? 'In-Person Meetup'
                      : 'Online Transaction'}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {transaction.method === 'meetup'
                      ? 'Face-to-face exchange at agreed location'
                      : 'Digital payment and shipping'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },

    {
      id: 'party',
      title: 'Other Party',
      icon: User,
      content: (
        <div className="space-y-3">
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
                  {(seller?.name || transaction.sellerName).charAt(0)}
                </div>
                <div className="flex-1">
                  <Link
                    href={ROUTES.PROFILE.VIEW(seller?.id || 'user-2')}
                    className="text-base font-semibold text-white hover:underline"
                  >
                    {seller?.name || transaction.sellerName}
                  </Link>
                  {seller && (
                    <div className="mt-1">
                      <VerificationBadge
                        isVerified={seller.isVerified}
                        size="sm"
                      />
                    </div>
                  )}
                  <p className="mt-1 text-xs text-neutral-500">
                    Verified on platform since Jan 2023
                  </p>
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-2">
                <p className="mb-2 text-xs text-neutral-500">Their Offer</p>
                <div className="rounded-lg border border-neutral-800/50 bg-black/40 p-3">
                  <p className="text-sm text-white">
                    {transaction.currency}
                    {transaction.price.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Firm price, includes original box and accessories
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white">
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Completed deals</span>
                  <span className="font-medium text-white">47</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Success rate</span>
                  <span className="font-medium text-emerald-400">98.5%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Avg response time</span>
                  <span className="font-medium text-white">2.3 hours</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'ai',
      title: 'AI Changes',
      icon: Sparkles,
      content: (
        <div className="space-y-3">
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardContent className="space-y-3">
              <div>
                <p className="mb-2 text-xs text-neutral-500">
                  Original AI Summary
                </p>
                <div className="rounded-lg border border-neutral-800/50 bg-black/40 p-3">
                  <p className="text-sm text-neutral-300">
                    {aiChanges.original}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs text-neutral-500">
                  Amendments Based on Your Input
                </p>
                <div className="space-y-2">
                  {aiChanges.amendments.map((amendment, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                          <span className="text-xs font-bold text-white">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-blue-300">
                            {amendment.field}
                          </p>
                          <div className="mt-1 space-y-1">
                            <p className="text-xs text-neutral-400">
                              <span className="line-through">
                                {amendment.from}
                              </span>
                            </p>
                            <p className="text-xs font-medium text-white">
                              → {amendment.to}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-neutral-500 italic">
                            {amendment.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-neutral-800 bg-black/60">
                <div className="border-b border-neutral-800 bg-neutral-900 px-3 py-2">
                  <p className="font-mono text-xs text-neutral-400">
                    Original vs Modified Summary
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {aiChanges.originalLines.map((line, index) => {
                    const modifiedLine = aiChanges.modifiedLines[index];
                    const isChanged = line !== modifiedLine;

                    return (
                      <div key={index}>
                        {isChanged && (
                          <div className="flex items-start border-l-4 border-red-500 bg-red-500/10">
                            <span className="w-12 flex-shrink-0 px-3 py-1 font-mono text-xs text-red-400 select-none">
                              -{index + 1}
                            </span>
                            <span className="flex-1 px-3 py-1 font-mono text-xs text-red-300">
                              {line}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex items-start ${
                            isChanged
                              ? 'border-l-4 border-emerald-500 bg-emerald-500/10'
                              : 'border-l-4 border-transparent bg-transparent'
                          }`}
                        >
                          <span
                            className={`w-12 flex-shrink-0 px-3 py-1 font-mono text-xs select-none ${
                              isChanged
                                ? 'text-emerald-400'
                                : 'text-neutral-600'
                            }`}
                          >
                            {isChanged ? `+${index + 1}` : ` ${index + 1}`}
                          </span>
                          <span
                            className={`flex-1 px-3 py-1 font-mono text-xs ${
                              isChanged
                                ? 'text-emerald-300'
                                : 'text-neutral-400'
                            }`}
                          >
                            {modifiedLine}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'occurrence',
      title: 'Transaction Details',
      icon: MapPinned,
      content: (
        <div className="space-y-3">
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardContent className="space-y-3 pt-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Location</p>
                    <p className="text-sm font-medium text-white">
                      {transactionOccurrence.location}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {transactionOccurrence.exactLocation}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Scheduled Time</p>
                    <p className="text-sm font-medium text-white">
                      {transactionOccurrence.scheduledTime}
                    </p>
                    {transactionOccurrence.actualTime && (
                      <p className="text-xs text-emerald-400">
                        Completed: {transactionOccurrence.actualTime}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Disputes</p>
                    <p className="text-sm font-medium text-white">
                      {transactionOccurrence.disputes.length === 0
                        ? 'None'
                        : `${transactionOccurrence.disputes.length} active`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardContent className="pt-4">
              <div className="flex aspect-video items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900">
                <div className="text-center">
                  <MapPinned className="mx-auto mb-2 h-12 w-12 text-neutral-600" />
                  <p className="text-sm text-neutral-500">Map View</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    Location pinned on map
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardContent className="pt-4">
              <div className="flex items-center justify-center py-6">
                {transactionOccurrence.status === 'completed' && (
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)]">
                      <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-emerald-400">
                      Completed
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Transaction successful
                    </p>
                  </div>
                )}
                {transactionOccurrence.status === 'pending' && (
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.6)]">
                      <Clock className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-yellow-400">
                      Pending
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Awaiting confirmation
                    </p>
                  </div>
                )}
                {transactionOccurrence.status === 'active' && (
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                      <div className="h-3 w-3 rounded-full bg-white"></div>
                    </div>
                    <p className="text-lg font-semibold text-blue-400">
                      Active
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Transaction in progress
                    </p>
                  </div>
                )}
                {transactionOccurrence.status === 'disputed' && (
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                      <AlertCircle className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-red-400">
                      Disputed
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Issue reported
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10"
              >
                <Flag className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="border-neutral-800 bg-neutral-900">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Report Transaction Issue
                </DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Describe the issue you encountered with this transaction.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-neutral-200">
                    Issue Description
                  </Label>
                  <Input
                    id="notes"
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    className="border-neutral-700 bg-black/40 text-white"
                    placeholder="Describe what went wrong..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setReportOpen(false)}
                  className="border-neutral-700 text-neutral-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReport}
                  className="bg-red-600 text-white hover:bg-red-700"
                  disabled={!reportNotes.trim()}
                >
                  Submit Report
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      <div className="border-b border-neutral-800 bg-neutral-950">
        <div className="mx-auto max-w-3xl">
          <TransactionProgress
            currentSection={currentSection}
            totalSections={sections.length}
            onSectionClick={setCurrentSection}
          />
        </div>
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
