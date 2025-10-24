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
import type {
  Escrow,
  Deliverable,
  DeliverableWithStatus,
  OracleVerification,
} from '@/types/escrow';
import { DeliverableStatus } from '@/components/escrow/deliverable-status';
import {
  getOverallProgress,
  getOracleVerificationSummary,
} from '@/lib/escrow/deliverable-status';

export default function TransactionActive({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [buyerConfirmed, setBuyerConfirmed] = useState(false);
  const [sellerConfirmed] = useState(false);
  const [escrowData, setEscrowData] = useState<Escrow | null>(null);
  const [deliverableStatuses, setDeliverableStatuses] = useState<
    DeliverableWithStatus[]
  >([]);
  const [oracleVerifications, setOracleVerifications] = useState<
    OracleVerification[]
  >([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  // Use real data instead of mock data
  const { status, setStatus, loading, error } = useTransactionStatus(id);

  // Debug logging
  useEffect(() => {
    if (error) {
      console.error('Transaction status error:', error);
    }
    if (status) {
      console.log('Transaction status loaded:', {
        transactionId: status.transaction?.id,
        status: status.transaction?.status,
        participantCount: status.participants?.length,
        hasEscrow: !!status.escrow,
        deliverableCount: status.deliverable_statuses?.length || 0,
      });
    }
  }, [status, error]);

  // Handle automatic redirect when both parties confirm
  useEffect(() => {
    if (
      status?.participants?.every((p) => p.has_confirmed) &&
      status?.transaction?.id
    ) {
      console.log('Both parties confirmed! Redirecting to homepage...');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  }, [status?.participants, status?.transaction?.id, router]);

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

      // Fetch escrow data with deliverables if it exists
      const { data: escrow } = await supabase
        .from('escrows')
        .select(
          `
          *,
          deliverables(*)
        `
        )
        .eq('transaction_id', id)
        .single();

      if (escrow) {
        setEscrowData(escrow);

        // Fetch oracle verifications for this escrow
        const { data: verifications } = await supabase
          .from('oracle_verifications')
          .select('*')
          .eq('escrow_id', escrow.id);

        if (verifications) {
          setOracleVerifications(verifications);
        }

        // Calculate deliverable statuses with verifications
        const enrichedDeliverables =
          escrow.deliverables?.map(
            (deliverable: { id: string; [key: string]: unknown }) => ({
              ...deliverable,
              verification: verifications?.find(
                (v) =>
                  // Match verification to deliverable through proofs
                  v.escrow_id === escrow.id
              ),
              proofs: [], // Will be populated by API
            })
          ) || [];

        setDeliverableStatuses(enrichedDeliverables);
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
  const getTransactionTypeIcon = (type: string) => {
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

  const getTransactionTypeLabel = (type: string) => {
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

  const handleConfirmTransaction = async () => {
    if (!currentUserId) return;

    try {
      const response = await fetch(`/api/transaction/${id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error confirming transaction:', errorData);
        return;
      }

      const result = await response.json();
      console.log('Transaction confirmation result:', result);

      if (result.both_confirmed) {
        // Both parties confirmed - redirect to homepage after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        // Just wait for the real-time update to handle the UI change
        // The useTransactionStatus hook will automatically refetch and update the UI
        console.log('Waiting for other party to confirm...');
      }
    } catch (error) {
      console.error('Error confirming transaction:', error);
    }
  };

  const handleConfirmDeliverable = async (deliverableType: string) => {
    if (!currentUserId) {
      return;
    }

    try {
      const response = await fetch(
        `/api/transaction/${id}/confirm-deliverable`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ deliverableType }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error confirming deliverable:', errorData);
        return;
      }

      // Refresh the page to get the latest data from the server
      // This ensures both users see the updated status
      // window.location.reload();
    } catch (error) {
      console.error('Error confirming deliverable:', error);
    }
  };

  // Helper function to determine if current user can confirm a deliverable
  const canConfirmDeliverable = (deliverableType: string) => {
    if (!currentUserId || !status?.participants) {
      return false;
    }

    const currentUser = status.participants.find(
      (p) => p.user_id === currentUserId
    );

    if (!currentUser) {
      return false;
    }

    // For item deliverable: creator (seller) can confirm (they delivered the item)
    // For payment deliverable: participant (buyer) can confirm (they received the payment)
    if (deliverableType === 'item') {
      return currentUser.role === 'creator';
    } else if (deliverableType === 'payment') {
      return currentUser.role === 'invitee';
    }

    return false;
  };

  // Check if all deliverables are confirmed
  const allDeliverablesConfirmed =
    status?.participants?.every(
      (p) => p.item_confirmed && p.payment_confirmed
    ) || false;

  const bothConfirmed = escrowData
    ? escrowData.initiator_confirmation === 'confirmed' &&
      escrowData.participant_confirmation === 'confirmed'
    : allDeliverablesConfirmed;

  const isCurrentUserConfirmed = escrowData
    ? currentUserId === escrowData.initiator_id
      ? escrowData.initiator_confirmation === 'confirmed'
      : escrowData.participant_confirmation === 'confirmed'
    : buyerConfirmed;

  // Transform transaction data for display
  const transformedTransaction = {
    price: parseFloat(String(transaction.price || '0')),
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
              {/* Item Information */}
              <div className="mb-6 space-y-4">
                <div className="rounded-lg bg-black/40 p-4">
                  <h3 className="mb-3 text-sm font-medium text-neutral-300">
                    Item Information
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-neutral-500">Item Name</p>
                      <p className="text-sm text-white">
                        {transaction.item_name || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Category</p>
                      <p className="text-sm text-white">
                        {transaction.category || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Condition</p>
                      <p className="text-sm text-white">
                        {transaction.condition || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Quantity</p>
                      <p className="text-sm text-white">
                        {transaction.quantity || '1'}
                      </p>
                    </div>
                  </div>
                  {transaction.item_description && (
                    <div className="mt-3">
                      <p className="text-xs text-neutral-500">Description</p>
                      <p className="text-sm text-white">
                        {transaction.item_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Type and Location */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg bg-black/40 p-3">
                  {React.createElement(
                    getTransactionTypeIcon(
                      transformedTransaction.type || 'meetup'
                    ),
                    {
                      className: 'mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400',
                    }
                  )}
                  <div>
                    <p className="mb-1 text-xs text-neutral-500">
                      {getTransactionTypeLabel(
                        transformedTransaction.type || 'meetup'
                      )}
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

              {/* Additional Details based on transaction type */}
              {transaction.transaction_type === 'delivery' &&
                transaction.delivery_method && (
                  <div className="mt-4 rounded-lg bg-black/40 p-3">
                    <p className="mb-1 text-xs text-neutral-500">
                      Delivery Method
                    </p>
                    <p className="text-sm text-white">
                      {transaction.delivery_method}
                    </p>
                  </div>
                )}

              {transaction.transaction_type === 'online' && (
                <div className="mt-4 space-y-3">
                  {transaction.online_platform && (
                    <div className="rounded-lg bg-black/40 p-3">
                      <p className="mb-1 text-xs text-neutral-500">Platform</p>
                      <p className="text-sm text-white">
                        {transaction.online_platform}
                      </p>
                    </div>
                  )}
                  {transaction.online_contact && (
                    <div className="rounded-lg bg-black/40 p-3">
                      <p className="mb-1 text-xs text-neutral-500">Contact</p>
                      <p className="text-sm text-white">
                        {transaction.online_contact}
                      </p>
                    </div>
                  )}
                  {transaction.online_instructions && (
                    <div className="rounded-lg bg-black/40 p-3">
                      <p className="mb-1 text-xs text-neutral-500">
                        Instructions
                      </p>
                      <p className="text-sm text-white">
                        {transaction.online_instructions}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 rounded-lg bg-black/40 p-3">
                <p className="mb-2 text-xs text-neutral-500">Amount</p>
                <p className="text-2xl font-bold text-white">
                  ₱{transformedTransaction.price.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Deliverable Status - Always Show */}
          <Card className="border-orange-500/30 bg-gradient-to-b from-orange-900/20 to-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Package className="h-5 w-5 text-orange-400" />
                Deliverable Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Item Deliverable */}
                <div className="flex items-center justify-between rounded-lg bg-black/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20">
                      <Package className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {transaction.item_name || 'Item'}
                      </p>
                      <p className="text-sm text-neutral-400">
                        {transaction.item_description || 'Item to be delivered'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge
                        className={
                          status?.participants?.every((p) => p.item_confirmed)
                            ? 'border-green-500/30 bg-green-500/20 text-green-300'
                            : 'border-orange-500/30 bg-orange-500/20 text-orange-300'
                        }
                      >
                        {status?.participants?.every((p) => p.item_confirmed)
                          ? 'Confirmed'
                          : 'Pending'}
                      </Badge>
                      <p className="mt-1 text-xs text-neutral-500">
                        {transaction.quantity || '1'} unit
                        {transaction.quantity && transaction.quantity > 1
                          ? 's'
                          : ''}
                      </p>
                    </div>
                    {(() => {
                      const allItemConfirmed = status?.participants?.every(
                        (p) => p.item_confirmed
                      );
                      const canConfirm = canConfirmDeliverable('item');

                      return (
                        !allItemConfirmed &&
                        canConfirm && (
                          <Button
                            onClick={() => handleConfirmDeliverable('item')}
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Confirm
                          </Button>
                        )
                      );
                    })()}
                    {!status?.participants?.every((p) => p.item_confirmed) &&
                      !canConfirmDeliverable('item') && (
                        <div className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-500">
                          Waiting for receiver
                        </div>
                      )}
                  </div>
                </div>

                {/* Payment Deliverable */}
                <div className="flex items-center justify-between rounded-lg bg-black/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                      <DollarSign className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Payment</p>
                      <p className="text-sm text-neutral-400">
                        ₱{transformedTransaction.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <Badge
                        className={
                          status?.participants?.every(
                            (p) => p.payment_confirmed
                          )
                            ? 'border-green-500/30 bg-green-500/20 text-green-300'
                            : 'border-orange-500/30 bg-orange-500/20 text-orange-300'
                        }
                      >
                        {status?.participants?.every((p) => p.payment_confirmed)
                          ? 'Confirmed'
                          : 'Pending'}
                      </Badge>
                      <p className="mt-1 text-xs text-neutral-500">
                        {transaction.transaction_type === 'meetup'
                          ? 'Cash on meetup'
                          : transaction.transaction_type === 'delivery'
                            ? 'Payment on delivery'
                            : 'Online payment'}
                      </p>
                    </div>
                    {(() => {
                      const allPaymentConfirmed = status?.participants?.every(
                        (p) => p.payment_confirmed
                      );
                      const canConfirm = canConfirmDeliverable('payment');

                      return (
                        !allPaymentConfirmed &&
                        canConfirm && (
                          <Button
                            onClick={() => handleConfirmDeliverable('payment')}
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Confirm
                          </Button>
                        )
                      );
                    })()}
                    {!status?.participants?.every((p) => p.payment_confirmed) &&
                      !canConfirmDeliverable('payment') && (
                        <div className="rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-500">
                          Waiting for receiver
                        </div>
                      )}
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="mt-4 rounded-lg bg-black/40 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-neutral-300">
                      Overall Progress
                    </span>
                    <span className="text-sm text-white">
                      {allDeliverablesConfirmed ? '100%' : '50%'}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-700">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        allDeliverablesConfirmed
                          ? 'bg-green-500'
                          : 'bg-orange-500'
                      }`}
                      style={{
                        width: allDeliverablesConfirmed ? '100%' : '50%',
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    {allDeliverablesConfirmed
                      ? 'All deliverables confirmed successfully'
                      : 'Waiting for deliverable confirmations'}
                  </p>
                </div>
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
                  {/* Overall Progress */}
                  {deliverableStatuses.length > 0 && (
                    <div className="rounded-lg bg-black/40 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-300">
                          Overall Progress
                        </span>
                        <span className="text-sm text-white">
                          {getOverallProgress(deliverableStatuses)}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-neutral-700">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                          style={{
                            width: `${getOverallProgress(deliverableStatuses)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Oracle Verification Summary */}
                  {oracleVerifications.length > 0 && (
                    <div className="rounded-lg bg-black/40 p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-300">
                          Oracle Verification Summary
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-medium text-green-400">
                            {
                              oracleVerifications.filter((v) => v.verified)
                                .length
                            }
                          </div>
                          <div className="text-neutral-400">Verified</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-red-400">
                            {
                              oracleVerifications.filter((v) => !v.verified)
                                .length
                            }
                          </div>
                          <div className="text-neutral-400">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-blue-400">
                            {oracleVerifications.length}
                          </div>
                          <div className="text-neutral-400">Total</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Deliverables Status */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-blue-300">
                      Deliverables Status
                    </h4>
                    <div className="space-y-3">
                      {deliverableStatuses.map((deliverable, index) => (
                        <DeliverableStatus
                          key={deliverable.id || index}
                          deliverable={deliverable}
                          verification={deliverable.verification}
                          proofs={deliverable.proofs}
                          partyName={
                            deliverable.party_responsible === 'initiator'
                              ? seller?.name || 'Creator'
                              : buyer?.name || 'Participant'
                          }
                          currentUserId={currentUserId || ''}
                          escrow={escrowData}
                          onProofSubmitted={() => {
                            // Refresh data after proof submission
                            window.location.reload();
                          }}
                        />
                      ))}
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
                {/* Participant */}
                <div className="flex items-center justify-between rounded-lg border border-neutral-800/50 bg-black/40 p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={buyer?.name || 'Unknown Participant'}
                      avatar={buyer?.avatar}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {buyer?.name || 'Unknown Participant'}
                      </p>
                      <p className="text-xs text-neutral-500">Participant</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {buyer?.has_confirmed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-400" />
                    )}
                    <span
                      className={`text-xs ${buyer?.has_confirmed ? 'text-green-400' : 'text-yellow-400'}`}
                    >
                      {buyer?.has_confirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Creator */}
                <div className="flex items-center justify-between rounded-lg border border-neutral-800/50 bg-black/40 p-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={seller?.name || 'Unknown Creator'}
                      avatar={seller?.avatar}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {seller?.name || 'Unknown Creator'}
                      </p>
                      <p className="text-xs text-neutral-500">Creator</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {seller?.has_confirmed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-400" />
                    )}
                    <span
                      className={`text-xs ${seller?.has_confirmed ? 'text-green-400' : 'text-yellow-400'}`}
                    >
                      {seller?.has_confirmed ? 'Confirmed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation Button */}
              {!status?.participants?.find((p) => p.user_id === currentUserId)
                ?.has_confirmed && (
                <div className="mt-4 rounded-lg border border-blue-800/50 bg-blue-900/20 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-200">
                        Confirm Transaction
                      </p>
                      <p className="text-xs text-blue-300/70">
                        {allDeliverablesConfirmed
                          ? 'All deliverables confirmed. Ready to finalize transaction.'
                          : 'Confirm all deliverables before proceeding'}
                      </p>
                    </div>
                    <Button
                      onClick={handleConfirmTransaction}
                      disabled={!allDeliverablesConfirmed}
                      className={`${
                        allDeliverablesConfirmed
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'cursor-not-allowed bg-gray-600 text-gray-400'
                      }`}
                      size="sm"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {allDeliverablesConfirmed
                        ? 'Confirm'
                        : 'Complete Deliverables First'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Waiting for other party */}
              {status?.participants?.find((p) => p.user_id === currentUserId)
                ?.has_confirmed &&
                !status?.participants?.every((p) => p.has_confirmed) && (
                  <div className="mt-4 rounded-lg border border-yellow-800/50 bg-yellow-900/20 p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 animate-pulse text-yellow-400" />
                      <div>
                        <p className="text-sm font-medium text-yellow-200">
                          Waiting for other party to confirm
                        </p>
                        <p className="text-xs text-yellow-300/70">
                          You have confirmed. Waiting for the other participant
                          to complete their confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Both Confirmed Status */}
              {status?.participants?.every((p) => p.has_confirmed) && (
                <div className="mt-4 rounded-lg border border-green-800/50 bg-green-900/20 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 animate-pulse text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-green-200">
                        Both parties confirmed! Transaction completed
                        successfully.
                      </p>
                      <p className="text-xs text-green-300/70">
                        Redirecting to homepage...
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
}
