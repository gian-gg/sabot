'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { UserAvatar } from '@/components/user/user-avatar';
import { VerificationBadge } from '@/components/user/verification-badge';
import { mockTransactions } from '@/lib/mock-data/transactions';
import { getUserById } from '@/lib/mock-data/users';
import {
  Calendar,
  MapPin,
  AlertCircle,
  Play,
  CheckCircle,
  Flag,
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

interface TransactionPageProps {
  params: Promise<{ id: string }>;
}

export default function TransactionPage({ params }: TransactionPageProps) {
  const { id } = use(params);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportNotes, setReportNotes] = useState('');

  const transaction = mockTransactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <div className="flex h-screen w-screen flex-col bg-black">
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md border-neutral-800/60 bg-neutral-900/40">
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

  // Mock user lookup
  const buyer = getUserById('user-1');
  const seller = getUserById('user-2');

  const handleReport = () => {
    // In real app, this would create a report in the database
    console.log('Creating report with notes:', reportNotes);
    setReportOpen(false);
    setReportNotes('');
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1000px] space-y-6 px-8 py-8">
          {/* Status Card */}
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">
                      {transaction.type.charAt(0).toUpperCase() +
                        transaction.type.slice(1).replace('-', ' ')}
                    </h1>
                    <Badge
                      variant={
                        transaction.status === 'completed'
                          ? 'default'
                          : transaction.status === 'active'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {transaction.status.charAt(0).toUpperCase() +
                        transaction.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="font-mono text-sm text-neutral-500">
                    {transaction.id}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">
                    {transaction.currency}
                    {transaction.price.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {transaction.timestamp.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-300">
                  {transaction.location}
                </p>
              </CardContent>
            </Card>

            <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-white">
                  <Calendar className="h-4 w-4" />
                  Platform
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-300">
                  {transaction.platform || 'Not specified'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Participants Card */}
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardHeader>
              <CardTitle className="text-white">Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Buyer */}
                <div className="rounded-lg border border-neutral-800/50 bg-black/40 p-4">
                  <p className="mb-3 text-xs text-neutral-500">Buyer</p>
                  <div className="flex items-center gap-3">
                    {/* <UserAvatar
                      name={buyer?.name || transaction.buyerName}
                      avatar={buyer?.avatar}
                      size="md"
                    /> */}
                    <div className="flex-1">
                      <Link
                        href={ROUTES.PROFILE.VIEW(buyer?.id || 'user-1')}
                        className="text-sm font-medium text-white hover:underline"
                      >
                        {buyer?.name || transaction.buyerName}
                      </Link>
                      {buyer && (
                        <div className="mt-1">
                          <VerificationBadge
                            isVerified={buyer.isVerified}
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Seller */}
                <div className="rounded-lg border border-neutral-800/50 bg-black/40 p-4">
                  <p className="mb-3 text-xs text-neutral-500">Seller</p>
                  <div className="flex items-center gap-3">
                    {/* <UserAvatar
                      name={seller?.name || transaction.sellerName}
                      avatar={seller?.avatar}
                      size="md"
                    /> */}
                    <div className="flex-1">
                      <Link
                        href={ROUTES.PROFILE.VIEW(seller?.id || 'user-2')}
                        className="text-sm font-medium text-white hover:underline"
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
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardContent className="pt-6">
              {transaction.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-white text-black hover:bg-neutral-200"
                    asChild
                  >
                    <Link href={ROUTES.TRANSACTION.ACTIVE(transaction.id)}>
                      <Play className="mr-2 h-4 w-4" />
                      Start Transaction
                    </Link>
                  </Button>
                </div>
              )}

              {transaction.status === 'active' && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    asChild
                  >
                    <Link href={ROUTES.TRANSACTION.ACTIVE(transaction.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Completion
                    </Link>
                  </Button>
                </div>
              )}

              {transaction.status === 'completed' && (
                <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-300">
                      Transaction Completed Successfully
                    </p>
                    <p className="mt-1 text-xs text-green-400/70">
                      Both parties have confirmed completion
                    </p>
                  </div>
                </div>
              )}

              {/* Report Button (available for all statuses) */}
              <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-3 w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
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
                      Our AI will generate an official report.
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
                    <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                      <p className="text-xs text-blue-300">
                        Your report will be reviewed within 24 hours.
                        AI-generated documentation will be sent to relevant
                        authorities if needed.
                      </p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
