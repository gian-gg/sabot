'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/core/page-header';
import { UserAvatar } from '@/components/user/user-avatar';
import {
  Radio,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';

interface ActiveTransactionPageProps {
  params: Promise<{ id: string }>;
}

export default function ActiveTransactionPage({
  params,
}: ActiveTransactionPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [buyerConfirmed, setBuyerConfirmed] = useState(false);
  const [sellerConfirmed] = useState(false);

  // Use real data instead of mock data
  const { status, loading, error } = useTransactionStatus(id);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col">
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md border-neutral-800/60 bg-neutral-900/40">
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
      <div className="flex h-screen w-screen flex-col">
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="w-full max-w-md border-neutral-800/60 bg-neutral-900/40">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-neutral-400">Error: {error}</p>
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
      <div className="flex h-screen w-screen flex-col">
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

  // Transform data for component compatibility
  const transformedTransaction = {
    id: transaction.id,
    price: transaction.price || 0,
    currency: 'USD',
    status: transaction.status,
    location: transaction.meeting_location || 'Location not set',
  };

  // Get participants from real data
  const creator = status.participants.find((p) => p.role === 'creator');
  const invitee = status.participants.find((p) => p.role === 'invitee');

  // Mock user data - replace with real user fetching
  const buyer = invitee
    ? { id: invitee.user_id, name: 'Buyer Name', avatar: undefined }
    : null; // Fetch real user data
  const seller = creator
    ? { id: creator.user_id, name: 'Seller Name', avatar: undefined }
    : null; // Fetch real user data

  const handleConfirmCompletion = () => {
    // Simulate current user confirming (in this case, buyer)
    setBuyerConfirmed(true);

    // Check if both confirmed
    if (sellerConfirmed) {
      // Redirect to transaction detail page
      setTimeout(() => {
        router.push(ROUTES.TRANSACTION.VIEW(transaction.id));
      }, 2000);
    }
  };

  const bothConfirmed = buyerConfirmed && sellerConfirmed;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      <PageHeader />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1000px] space-y-6 px-8 py-8">
          {/* Animated Status Banner */}
          <div className="relative overflow-hidden rounded-lg border border-green-500/30 bg-gradient-to-r from-green-900/20 via-green-800/20 to-green-900/20 p-6">
            <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent" />
            <div className="relative flex items-center gap-4">
              <div className="relative">
                <Radio className="h-10 w-10 text-green-400" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-green-500" />
                </span>
              </div>
              <div className="flex-1">
                <h2 className="mb-1 text-xl font-bold text-white">
                  Transaction Mode Active
                </h2>
                <p className="text-sm text-green-300">
                  Live monitoring enabled • Safety features activated
                </p>
              </div>
              <Badge className="border-green-500/30 bg-green-500/20 text-green-300">
                LIVE
              </Badge>
            </div>
          </div>

          {/* Transaction Details */}
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardHeader>
              <CardTitle className="text-white">Transaction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                  <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                  <div>
                    <p className="mb-1 text-xs text-neutral-500">
                      Meetup Location
                    </p>
                    <p className="text-sm text-white">
                      {transformedTransaction.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                  <div>
                    <p className="mb-1 text-xs text-neutral-500">Started</p>
                    <p className="text-sm text-white">
                      {new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-black/40 p-3">
                <p className="mb-2 text-xs text-neutral-500">Amount</p>
                <p className="text-2xl font-bold text-white">
                  {transformedTransaction.currency}
                  {transformedTransaction.price.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Participants Status */}
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardHeader>
              <CardTitle className="text-white">Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Buyer */}
                <div className="flex items-center justify-between rounded-lg border border-neutral-800/50 bg-black/40 p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={buyer?.name || 'Unknown Buyer'}
                      avatar={buyer?.avatar}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {buyer?.name || 'Unknown Buyer'}
                      </p>
                      <p className="text-xs text-neutral-500">Buyer</p>
                    </div>
                  </div>
                  {buyerConfirmed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-neutral-600" />
                  )}
                </div>

                {/* Seller */}
                <div className="flex items-center justify-between rounded-lg border border-neutral-800/50 bg-black/40 p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={seller?.name || 'Unknown Seller'}
                      avatar={seller?.avatar}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {seller?.name || 'Unknown Seller'}
                      </p>
                      <p className="text-xs text-neutral-500">Seller</p>
                    </div>
                  </div>
                  {sellerConfirmed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-neutral-600" />
                  )}
                </div>
              </div>

              {!bothConfirmed && (
                <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                  <p className="text-xs text-blue-300">
                    Both parties must confirm completion before the transaction
                    can be finalized
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-red-500/30 bg-gradient-to-b from-red-900/20 to-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                <div className="flex-1">
                  <p className="mb-1 text-sm font-medium text-red-300">
                    Emergency Features Active
                  </p>
                  <p className="mb-3 text-xs text-red-400/70">
                    Your emergency contact will be notified if you trigger an
                    alert
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Trigger Emergency Alert
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completion Card */}
          {bothConfirmed ? (
            <Card className="border-green-500/30 bg-gradient-to-b from-green-900/20 to-green-950/20">
              <CardContent className="pt-6">
                <div className="space-y-4 text-center">
                  <div className="flex justify-center">
                    <div className="relative">
                      <CheckCircle2 className="h-16 w-16 text-green-400" />
                      <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-5 w-5 rounded-full bg-green-500" />
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-white">
                      Transaction Completed!
                    </h3>
                    <p className="text-sm text-green-300">
                      Both parties have confirmed. Finalizing transaction...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
              <CardContent className="space-y-4 pt-6">
                <div className="text-center">
                  <h3 className="mb-2 text-base font-semibold text-white">
                    Confirm Transaction Completion
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Once you&apos;ve verified the item/service, confirm
                    completion below
                  </p>
                </div>

                <Button
                  onClick={handleConfirmCompletion}
                  disabled={buyerConfirmed}
                  className="w-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {buyerConfirmed ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirmed - Waiting for other party
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm Completion
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-neutral-700 text-neutral-300 hover:bg-white/5"
                  asChild
                >
                  <Link
                    href={ROUTES.TRANSACTION.VIEW(transformedTransaction.id)}
                  >
                    Back to Transaction
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
