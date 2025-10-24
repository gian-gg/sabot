'use client';

import React, { useState, use, useEffect } from 'react';
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
  Truck,
  Globe,
  Shield,
  Package,
  CreditCard,
  Smartphone,
  FileText,
  Wrench,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { createClient } from '@/lib/supabase/client';
import type { Escrow, Deliverable } from '@/types/escrow';

export default function TransactionActive({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [buyerConfirmed, setBuyerConfirmed] = useState(false);
  const [sellerConfirmed] = useState(false);
  const [escrowData, setEscrowData] = useState<Escrow | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  // Use real data instead of mock data
  const { status, loading, error } = useTransactionStatus(id);

  // Get participant profiles from status
  const buyer = status?.participants.find((p) => p.role === 'invitee');
  const seller = status?.participants.find((p) => p.role === 'creator');

  // Fetch current user and escrow data
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Fetch escrow data if it exists
      const { data: escrow } = await supabase
        .from('escrows')
        .select('*')
        .eq('transaction_id', id)
        .single();

      if (escrow) {
        setEscrowData(escrow);
      }
    };

    fetchData();
  }, [id]);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col">
        <PageHeader />
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

  // Helper functions
  const getTransactionTypeIcon = (type: string | undefined) => {
    switch (type) {
      case 'meetup':
        return MapPin;
      case 'delivery':
        return Truck;
      case 'online':
        return Globe;
      default:
        return MapPin;
    }
  };

  const getTransactionTypeLabel = (type: string | undefined) => {
    switch (type) {
      case 'meetup':
        return 'Meet Up';
      case 'delivery':
        return 'Delivery';
      case 'online':
        return 'Online';
      default:
        return 'Meet Up';
    }
  };

  const getTransactionLocation = () => {
    switch (transaction.transaction_type) {
      case 'meetup':
        return transaction.meeting_location || 'Location not set';
      case 'delivery':
        return transaction.delivery_address || 'Address not set';
      case 'online':
        return transaction.online_platform || 'Platform not set';
      default:
        return 'Location not set';
    }
  };

  const getTransactionTime = () => {
    switch (transaction.transaction_type) {
      case 'meetup':
        return transaction.meeting_time
          ? new Date(transaction.meeting_time).toLocaleString()
          : 'Time not set';
      case 'delivery':
        return 'Delivery scheduled';
      case 'online':
        return 'Online exchange';
      default:
        return 'Time not set';
    }
  };

  const getDeliverableIcon = (type: string) => {
    switch (type) {
      case 'item':
        return Package;
      case 'cash':
        return DollarSign;
      case 'digital_transfer':
        return CreditCard;
      case 'service':
        return Wrench;
      case 'document':
        return FileText;
      default:
        return Package;
    }
  };

  const getDeliverableStatus = (
    deliverable: Deliverable,
    partyResponsible: string
  ) => {
    if (escrowData) {
      if (partyResponsible === 'initiator') {
        return escrowData.initiator_confirmation === 'confirmed'
          ? 'completed'
          : 'pending';
      } else {
        return escrowData.participant_confirmation === 'confirmed'
          ? 'completed'
          : 'pending';
      }
    }
    return 'pending';
  };

  const handleConfirmCompletion = async () => {
    if (!currentUserId) return;

    try {
      const supabase = createClient();

      if (escrowData) {
        // Update escrow confirmation if escrow exists
        const isInitiator = currentUserId === escrowData.initiator_id;
        const updateField = isInitiator
          ? 'initiator_confirmation'
          : 'participant_confirmation';
        const timestampField = isInitiator
          ? 'initiator_confirmed_at'
          : 'participant_confirmed_at';

        const { error } = await supabase
          .from('escrows')
          .update({
            [updateField]: 'confirmed',
            [timestampField]: new Date().toISOString(),
          })
          .eq('id', escrowData.id);

        if (error) {
          console.error('Error confirming escrow completion:', error);
          return;
        }

        // Update local state
        setEscrowData((prev) =>
          prev
            ? {
                ...prev,
                [updateField]: 'confirmed',
                [timestampField]: new Date().toISOString(),
              }
            : null
        );

        // Check if both parties have confirmed
        const otherPartyConfirmed = isInitiator
          ? escrowData.participant_confirmation === 'confirmed'
          : escrowData.initiator_confirmation === 'confirmed';

        if (otherPartyConfirmed) {
          // Both parties confirmed - redirect to completion
          setTimeout(() => {
            router.push(ROUTES.TRANSACTION.VIEW(transaction.id));
          }, 2000);
        }
      } else {
        // No escrow - use simple confirmation logic
        setBuyerConfirmed(true);

        // For now, simulate both parties confirming after a delay
        setTimeout(() => {
          router.push(ROUTES.TRANSACTION.VIEW(transaction.id));
        }, 2000);
      }
    } catch (error) {
      console.error('Error confirming completion:', error);
    }
  };

  const bothConfirmed = escrowData
    ? escrowData.initiator_confirmation === 'confirmed' &&
      escrowData.participant_confirmation === 'confirmed'
    : buyerConfirmed && sellerConfirmed;

  const isCurrentUserConfirmed = escrowData
    ? currentUserId === escrowData.initiator_id
      ? escrowData.initiator_confirmation === 'confirmed'
      : escrowData.participant_confirmation === 'confirmed'
    : buyerConfirmed;

  // Transform transaction data for display
  const transformedTransaction = {
    price: transaction.price || 0,
    location: getTransactionLocation(),
    type: transaction.transaction_type,
    time: getTransactionTime(),
  };

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
                  {React.createElement(
                    getTransactionTypeIcon(transformedTransaction.type),
                    {
                      className: 'mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400',
                    }
                  )}
                  <div>
                    <p className="mb-1 text-xs text-neutral-500">
                      {getTransactionTypeLabel(transformedTransaction.type)}
                    </p>
                    <p className="text-sm text-white">
                      {transformedTransaction.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                  <div>
                    <p className="mb-1 text-xs text-neutral-500">Time</p>
                    <p className="text-sm text-white">
                      {transformedTransaction.time}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-black/40 p-3">
                <p className="mb-2 text-xs text-neutral-500">Amount</p>
                <p className="text-2xl font-bold text-white">
                  ₱{transformedTransaction.price.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Protection Status */}
          {escrowData && (
            <Card className="border-blue-500/30 bg-gradient-to-b from-blue-900/20 to-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="h-5 w-5 text-blue-400" />
                  Escrow Protection Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Deliverables Status */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-blue-300">
                      Deliverables Status
                    </h4>
                    <div className="space-y-2">
                      {escrowData.deliverables.map((deliverable, index) => {
                        const IconComponent = getDeliverableIcon(
                          deliverable.type
                        );
                        const status = getDeliverableStatus(
                          deliverable,
                          deliverable.party_responsible
                        );
                        const isCompleted = status === 'completed';

                        return (
                          <div
                            key={deliverable.id || index}
                            className="flex items-center justify-between rounded-lg bg-black/40 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <IconComponent className="h-4 w-4 text-blue-400" />
                              <div>
                                <p className="text-sm text-white">
                                  {deliverable.description}
                                </p>
                                <p className="text-xs text-neutral-400">
                                  {deliverable.party_responsible === 'initiator'
                                    ? 'Seller'
                                    : 'Buyer'}{' '}
                                  • {deliverable.type}
                                  {deliverable.value &&
                                    deliverable.currency && (
                                      <span>
                                        {' '}
                                        • {deliverable.currency}{' '}
                                        {deliverable.value.toLocaleString()}
                                      </span>
                                    )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-400" />
                              )}
                              <span
                                className={`text-xs ${isCompleted ? 'text-green-400' : 'text-yellow-400'}`}
                              >
                                {isCompleted ? 'Completed' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Arbiter Status */}
                  {escrowData.arbiter_requested && (
                    <div className="rounded-lg bg-black/40 p-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-amber-400" />
                        <span className="text-sm text-amber-300">
                          Arbiter Oversight Active
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-400">
                        Independent third-party mediation is available for
                        dispute resolution
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
                  <div className="flex items-center gap-2">
                    {escrowData ? (
                      <>
                        {escrowData.participant_confirmation === 'confirmed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : escrowData.participant_confirmation ===
                          'disputed' ? (
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-400" />
                        )}
                        <span
                          className={`text-xs ${
                            escrowData.participant_confirmation === 'confirmed'
                              ? 'text-green-400'
                              : escrowData.participant_confirmation ===
                                  'disputed'
                                ? 'text-red-400'
                                : 'text-yellow-400'
                          }`}
                        >
                          {escrowData.participant_confirmation === 'confirmed'
                            ? 'Confirmed'
                            : escrowData.participant_confirmation === 'disputed'
                              ? 'Disputed'
                              : 'Pending'}
                        </span>
                      </>
                    ) : (
                      <>
                        {buyerConfirmed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-400" />
                        )}
                        <span
                          className={`text-xs ${buyerConfirmed ? 'text-green-400' : 'text-yellow-400'}`}
                        >
                          {buyerConfirmed ? 'Confirmed' : 'Pending'}
                        </span>
                      </>
                    )}
                  </div>
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
                  <div className="flex items-center gap-2">
                    {escrowData ? (
                      <>
                        {escrowData.initiator_confirmation === 'confirmed' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : escrowData.initiator_confirmation === 'disputed' ? (
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-400" />
                        )}
                        <span
                          className={`text-xs ${
                            escrowData.initiator_confirmation === 'confirmed'
                              ? 'text-green-400'
                              : escrowData.initiator_confirmation === 'disputed'
                                ? 'text-red-400'
                                : 'text-yellow-400'
                          }`}
                        >
                          {escrowData.initiator_confirmation === 'confirmed'
                            ? 'Confirmed'
                            : escrowData.initiator_confirmation === 'disputed'
                              ? 'Disputed'
                              : 'Pending'}
                        </span>
                      </>
                    ) : (
                      <>
                        {sellerConfirmed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-400" />
                        )}
                        <span
                          className={`text-xs ${sellerConfirmed ? 'text-green-400' : 'text-yellow-400'}`}
                        >
                          {sellerConfirmed ? 'Confirmed' : 'Pending'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                <p className="text-xs text-blue-300">
                  {bothConfirmed
                    ? 'Both parties have confirmed completion. Transaction will be finalized.'
                    : 'Both parties must confirm completion before the transaction can be finalized'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-red-500/30 bg-gradient-to-b from-red-900/20 to-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-400" />
                <div>
                  <h3 className="mb-2 text-sm font-medium text-white">
                    Emergency Contact
                  </h3>
                  <p className="mb-3 text-xs text-neutral-400">
                    If you encounter any issues during the transaction, contact
                    our support team immediately.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call Support
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Report Issue
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-400" />
                    <h3 className="text-sm font-medium text-amber-300">
                      Transaction Safety
                    </h3>
                  </div>
                  <p className="mt-2 text-xs text-amber-200">
                    Verify the item/service before confirming completion. Once
                    you&apos;ve verified the item/service, confirm completion
                    below
                  </p>
                </div>

                <Button
                  onClick={handleConfirmCompletion}
                  disabled={isCurrentUserConfirmed}
                  className="w-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isCurrentUserConfirmed ? (
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
                  <Link href={ROUTES.TRANSACTION.VIEW(transaction.id)}>
                    View Transaction Details
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
