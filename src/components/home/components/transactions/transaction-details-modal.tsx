'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { exportTransactionToPDF } from '@/lib/pdf/export-transaction';
import { cn } from '@/lib/utils';
import type { TransactionStatus } from '@/types/transaction';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
  Shield,
  ArrowUpRight,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDate, formatStatusLabel } from '@/lib/utils/helpers';
import type { TransactionDetails } from '@/types/transaction';
import { useUserStore } from '@/store/user/userStore';
import { Copy } from 'lucide-react';

const statusIcons: Record<TransactionStatus, React.ElementType> = {
  completed: CheckCircle2,
  active: Activity,
  pending: Clock,
  disputed: XCircle,
  reported: AlertCircle,
  waiting_for_participant: Clock,
  both_joined: Users,
  screenshots_uploaded: Shield,
  cancelled: XCircle,
};

const statusColors: Record<TransactionStatus, string> = {
  completed: 'text-green-500 bg-green-500/10 border-green-500/20',
  active: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  pending: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  disputed: 'text-red-500 bg-red-500/10 border-red-500/20',
  reported: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  waiting_for_participant:
    'text-purple-500 bg-purple-500/10 border-purple-500/20',
  both_joined: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  screenshots_uploaded:
    'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
};

export function TransactionDetailsModal({
  transaction,
  open,
  onOpenChange,
}: {
  transaction: TransactionDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isExporting, setIsExporting] = useState(false);
  const user = useUserStore();

  if (!transaction) return null;

  const StatusIcon = statusIcons[transaction.status];

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportTransactionToPDF(transaction);
      toast.success('Transaction exported to PDF successfully');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export transaction to PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Determine transaction type label
  const transactionTypeLabel =
    transaction.transaction_type === 'meetup'
      ? 'In-Person Meetup'
      : transaction.transaction_type === 'delivery'
        ? 'Delivery'
        : 'Online Transaction';

  // Get location based on transaction type
  const getLocation = () => {
    if (transaction.transaction_type === 'meetup')
      return transaction.meeting_location;
    if (transaction.transaction_type === 'delivery')
      return transaction.delivery_address;
    if (transaction.transaction_type === 'online')
      return transaction.online_platform;
    return undefined;
  };

  const location = getLocation();

  const inviteLink = `${
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://sabot-hf.vercel.app'
  }/transaction/accept?id=${transaction.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-md flex-col gap-y-0 p-0 md:min-w-xl lg:min-w-4xl xl:min-w-5xl">
        {/* Sticky Header */}
        <div className="bg-background sticky top-0 z-10 flex-shrink-0 border-b px-6 py-4">
          {/* Title and Status Badge in one row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl leading-tight font-bold">
                {transaction.item_name}
              </DialogTitle>
              <div className="mt-1 flex items-center gap-2">
                <code className="bg-muted text-muted-foreground rounded px-2 py-1 font-mono text-xs">
                  {transaction.id}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 flex-shrink-0 p-0"
                  onClick={() => {
                    navigator.clipboard.writeText(transaction.id);
                    toast.success('Transaction ID copied!');
                  }}
                  title="Copy transaction ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'flex-shrink-0 px-3 py-1 text-xs whitespace-nowrap',
                statusColors[transaction.status]
              )}
            >
              <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
              {formatStatusLabel(transaction.status)}
            </Badge>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="mt-5 space-y-8">
            {/* Go to Transaction Page Button */}
            {(transaction.status === 'active' ||
              transaction.status === 'waiting_for_participant' ||
              transaction.status === 'both_joined' ||
              transaction.status === 'screenshots_uploaded') && (
              <Button variant="default" className="w-full" size="lg" asChild>
                <Link
                  href={`/transaction/invite?id=${transaction.id}`}
                  className="flex items-center justify-center gap-2"
                >
                  Go to Transaction
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Key Metrics Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border-border/50 bg-muted/20 border p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-12 w-12 items-center justify-center">
                    <DollarSign className="text-primary h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Price
                    </p>
                    <p className="font-bold">${transaction.price ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="border-border/50 bg-muted/20 border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center bg-blue-500/10">
                    <Calendar className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Created
                    </p>
                    <p className="text-sm font-semibold">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-border/50 bg-muted/20 border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center bg-amber-500/10">
                    <FileText className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Type
                    </p>
                    <p className="text-sm font-semibold">
                      {transactionTypeLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-border/50 bg-muted/20 border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center bg-purple-500/10">
                    <User className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Participant
                    </p>
                    <p className="text-sm font-semibold">
                      {(transaction.transaction_participants.length > 1 &&
                        transaction.transaction_participants[1]
                          .participant_name) ||
                        'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Link - Show when waiting for participant */}
            {transaction.status === 'waiting_for_participant' && (
              <div className="space-y-3 rounded-lg border border-purple-500/20 bg-purple-500/5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
                        <ExternalLink className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-purple-500">
                          Waiting for Participant
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          Share this link to invite them
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-background/50 space-y-2 rounded-md border border-purple-500/10 p-3">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Invitation Link
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted/30 hidden flex-1 overflow-hidden rounded-md border px-3 py-2 lg:block">
                      <p className="text-foreground truncate font-mono text-sm">
                        {inviteLink}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="w-full shrink-0 bg-purple-500 hover:bg-purple-600 lg:w-auto"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteLink);
                        toast.success('Link copied to clipboard!');
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-md bg-purple-500/5 p-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10">
                    <span className="text-xs font-bold text-purple-500">!</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    The other participant needs to click this link and join the
                    transaction before it can proceed. You can share it via
                    email, messaging apps, or any other method.
                  </p>
                </div>
              </div>
            )}

            <div className="h-auto w-full space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 flex items-center gap-2 font-semibold">
                    <FileText className="h-5 w-5" />
                    Transaction Details
                  </h3>
                  <div className="border-border/50 grid gap-4 space-y-4 border p-4 lg:grid-cols-2">
                    {transaction.item_description && (
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <MessageSquare className="text-muted-foreground h-4 w-4" />
                          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            Description
                          </p>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {transaction.item_description}
                        </p>
                      </div>
                    )}

                    {transaction.category && (
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <FileText className="text-muted-foreground h-4 w-4" />
                          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            Category
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {transaction.category}
                        </Badge>
                      </div>
                    )}

                    {location && (
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <MapPin className="text-muted-foreground h-4 w-4" />
                          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            {transaction.transaction_type === 'meetup' &&
                              'Meeting Location'}
                            {transaction.transaction_type === 'delivery' &&
                              'Delivery Address'}
                            {transaction.transaction_type === 'online' &&
                              'Platform'}
                          </p>
                        </div>
                        <p className="text-sm">{location}</p>
                      </div>
                    )}

                    {transaction.condition && (
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <FileText className="text-muted-foreground h-4 w-4" />
                          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            Condition
                          </p>
                        </div>
                        <p className="text-sm capitalize">
                          {transaction.condition}
                        </p>
                      </div>
                    )}

                    {transaction.quantity && (
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <FileText className="text-muted-foreground h-4 w-4" />
                          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            Quantity
                          </p>
                        </div>
                        <p className="text-sm">{transaction.quantity}</p>
                      </div>
                    )}

                    {transaction.meeting_time && (
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <Clock className="text-muted-foreground h-4 w-4" />
                          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                            Meeting Time
                          </p>
                        </div>
                        <p className="text-sm">
                          {formatDate(transaction.meeting_time)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Participants Section */}
              {transaction.transaction_participants &&
                transaction.transaction_participants.length > 1 && (
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 font-semibold">
                      <Users className="h-5 w-5" />
                      Participants
                    </h3>
                    <div className="border-border/50 space-y-3 rounded-lg border p-4">
                      {/* Creator (Current User) - Static */}
                      <div className="bg-muted/20 flex items-center gap-3 rounded-lg p-3">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || 'User'}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="from-primary/20 flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br to-blue-500/20">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            {user.name || 'Unknown User'}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {user.email || 'No email'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className="border-blue-500/20 bg-blue-500/10 text-xs text-blue-500"
                          >
                            Creator (You)
                          </Badge>
                        </div>
                      </div>

                      {/* Other Participants - Dynamic */}
                      {transaction.transaction_participants
                        .filter((participant) => participant.role !== 'creator')
                        .map((participant) => (
                          <div
                            key={participant.id}
                            className="bg-muted/20 flex items-center gap-3 rounded-lg p-3"
                          >
                            {participant.participant_avatar_url ||
                            participant.avatar ? (
                              <Image
                                src={
                                  participant.participant_avatar_url ||
                                  participant.avatar ||
                                  ''
                                }
                                alt={
                                  participant.participant_name ||
                                  participant.name ||
                                  'User'
                                }
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="from-primary/20 flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br to-blue-500/20">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-semibold">
                                {participant.participant_name ||
                                  participant.name ||
                                  'Unknown User'}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {participant.participant_email ||
                                  participant.email ||
                                  'No email'}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant="outline"
                                className="border-purple-500/20 bg-purple-500/10 text-xs text-purple-500"
                              >
                                Invitee
                              </Badge>
                              {participant.screenshot_uploaded && (
                                <p className="text-muted-foreground mt-1 text-xs">
                                  Screenshot uploaded
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Timeline Section */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Clock className="h-5 w-5" />
                  Transaction Timeline
                </h3>
                <div className="border-border/50 relative space-y-4 rounded-lg border p-4">
                  {/* Created */}
                  <div className="relative flex gap-4 pb-4">
                    <div className="bg-border absolute top-6 left-4 h-full w-px" />
                    <div className="relative z-10 mt-2 ml-2 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10" />
                    <div className="flex-1 pt-0.5">
                      <p className="font-medium">Transaction Created</p>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Participants joined */}
                  {transaction.transaction_participants &&
                    transaction.transaction_participants.map(
                      (participant, index) =>
                        participant.joined_at && (
                          <div
                            key={participant.id}
                            className="relative flex gap-4 pb-4"
                          >
                            <div
                              className={cn(
                                'bg-border absolute top-6 left-4 h-full w-px',
                                index ===
                                  transaction.transaction_participants.length -
                                    1 &&
                                  !transaction.transaction_participants.some(
                                    (p) => p.screenshot_uploaded
                                  ) &&
                                  transaction.status !== 'completed' &&
                                  'hidden'
                              )}
                            />
                            <div className="relative z-10 mt-2 ml-2 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10" />
                            <div className="flex-1 pt-0.5">
                              <p className="font-medium">
                                {(participant.participant_name ||
                                  participant.name) ??
                                  user.name}{' '}
                                joined
                              </p>
                              <p className="text-muted-foreground text-sm">
                                {formatDate(participant.joined_at)}
                              </p>
                            </div>
                          </div>
                        )
                    )}

                  {/* Screenshots uploaded */}
                  {transaction.transaction_participants &&
                    transaction.transaction_participants.some(
                      (p) => p.screenshot_uploaded
                    ) && (
                      <div className="relative flex gap-4 pb-4">
                        <div
                          className={cn(
                            'bg-border absolute top-6 left-4 h-full w-px',
                            !transaction.transaction_participants.some(
                              (p) => p.item_confirmed_at
                            ) &&
                              !transaction.transaction_participants.some(
                                (p) => p.payment_confirmed_at
                              ) &&
                              transaction.status !== 'completed' &&
                              'hidden'
                          )}
                        />
                        <div className="relative z-10 mt-2 ml-2 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10" />
                        <div className="flex-1 pt-0.5">
                          <p className="font-medium">Screenshots Uploaded</p>
                          <p className="text-muted-foreground text-sm">
                            {
                              transaction.transaction_participants.filter(
                                (p) => p.screenshot_uploaded
                              ).length
                            }{' '}
                            of {transaction.transaction_participants.length}{' '}
                            participants
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Item Confirmations */}
                  {transaction.transaction_participants &&
                    transaction.transaction_participants.some(
                      (p) => p.item_confirmed_at
                    ) && (
                      <div className="relative flex gap-4 pb-4">
                        <div
                          className={cn(
                            'bg-border absolute top-6 left-4 h-full w-px',
                            !transaction.transaction_participants.some(
                              (p) => p.payment_confirmed_at
                            ) &&
                              transaction.status !== 'completed' &&
                              'hidden'
                          )}
                        />
                        <div className="relative z-10 mt-2 ml-2 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10" />
                        <div className="flex-1 pt-0.5">
                          <p className="font-medium">Item Confirmed</p>
                          <p className="text-muted-foreground text-sm">
                            {transaction.transaction_participants
                              .filter((p) => p.item_confirmed_at)
                              .map(
                                (p) =>
                                  p.participant_name || p.name || 'Participant'
                              )
                              .join(', ')}{' '}
                            confirmed item receipt
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {formatDate(
                              transaction.transaction_participants.find(
                                (p) => p.item_confirmed_at
                              )?.item_confirmed_at || ''
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Payment Confirmations */}
                  {transaction.transaction_participants &&
                    transaction.transaction_participants.some(
                      (p) => p.payment_confirmed_at
                    ) && (
                      <div className="relative flex gap-4 pb-4">
                        <div
                          className={cn(
                            'bg-border absolute top-6 left-4 h-full w-px',
                            transaction.status !== 'completed' && 'hidden'
                          )}
                        />
                        <div className="relative z-10 mt-2 ml-2 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10" />
                        <div className="flex-1 pt-0.5">
                          <p className="font-medium">Payment Confirmed</p>
                          <p className="text-muted-foreground text-sm">
                            {transaction.transaction_participants
                              .filter((p) => p.payment_confirmed_at)
                              .map(
                                (p) =>
                                  p.participant_name || p.name || 'Participant'
                              )
                              .join(', ')}{' '}
                            confirmed payment
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {formatDate(
                              transaction.transaction_participants.find(
                                (p) => p.payment_confirmed_at
                              )?.payment_confirmed_at || ''
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Completed */}
                  {transaction.status === 'completed' && (
                    <div className="relative flex gap-4">
                      <div className="relative z-10 mt-2 ml-2 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/10" />
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium">Transaction Completed</p>
                        <p className="text-muted-foreground text-sm">
                          {formatDate(transaction.updated_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Pending status */}
                  {transaction.status === 'pending' && (
                    <div className="relative flex gap-4">
                      <div className="relative z-10 mt-2 ml-2 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500/10" />
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium">Awaiting Action</p>
                        <p className="text-muted-foreground text-sm">
                          Transaction is pending
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Active status */}
                  {transaction.status === 'active' && (
                    <div className="relative flex gap-4">
                      <div className="relative z-10 mt-2 ml-2 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-500/10" />
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium">Transaction Active</p>
                        <p className="text-muted-foreground text-sm">
                          In progress
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Disputed status */}
                  {transaction.status === 'disputed' && (
                    <div className="relative flex gap-4">
                      <div className="relative z-10 mt-2 ml-2 flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-red-500 bg-red-500/10" />
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium">Transaction Disputed</p>
                        <p className="text-muted-foreground text-sm">
                          Under review
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Contact Counterparty */}
              {transaction.transaction_participants.length > 1 && (
                <Button variant="outline" className="flex-1" asChild>
                  <Link
                    href={`mailto:${transaction.transaction_participants[1].participant_email}`}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Contact Counterparty
                  </Link>
                </Button>
              )}

              {/* Completed Transaction Actions */}
              {transaction.status === 'completed' && (
                <>
                  {transaction.hash && (
                    <Button variant="outline" className="flex-1" asChild>
                      <Link
                        href={`https://sepolia-blockscout.lisk.com/tx/${transaction.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on Blockchain
                      </Link>
                    </Button>
                  )}
                  <Button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    variant="outline"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
