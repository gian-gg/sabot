'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { AgreementStatus } from '@/types/agreement';
import {
  CheckCircle2,
  FileText,
  Users,
  User,
  X,
  Handshake,
  ExternalLink,
  ArrowUpRight,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDate, formatAgreementStatusLabel } from '@/lib/utils/helpers';
import type { AgreementWithParticipants } from '@/types/agreement';
import { useUserStore } from '@/store/user/userStore';
import { cancelAgreement } from '@/lib/supabase/db/agreements';

const statusIcons: Record<AgreementStatus, React.ElementType> = {
  waiting_for_participant: Users,
  'in-progress': Handshake,
  finalized: CheckCircle2,
  cancelled: X,
};

const statusColors: Record<AgreementStatus, string> = {
  waiting_for_participant:
    'text-purple-500 bg-purple-500/10 border-purple-500/20',
  'in-progress': 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  finalized: 'text-green-500 bg-green-500/10 border-green-500/20',
  cancelled: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
};

export function AgreementDetailsModal({
  agreement,
  open,
  onOpenChange,
  onAgreementUpdate,
}: {
  agreement: AgreementWithParticipants | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgreementUpdate?: () => void;
}) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const user = useUserStore();

  if (!agreement) return null;

  const isCreator = agreement.creator_id === user.id;
  const StatusIcon = statusIcons[agreement.status];
  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/agreement/accept?id=${agreement.id}`;

  const handleCancelClick = () => setShowCancelAlert(true);

  const handleCancelAgreement = async () => {
    if (!agreement?.id) return;

    setIsCancelling(true);
    try {
      const response = await cancelAgreement(agreement.id);

      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel agreement');
      }

      toast.success('Agreement cancelled successfully');
      onOpenChange(false);
      if (onAgreementUpdate) {
        onAgreementUpdate();
      }
    } catch (error) {
      console.error('Failed to cancel agreement:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to cancel agreement'
      );
    } finally {
      setIsCancelling(false);
      setShowCancelAlert(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-md flex-col gap-y-0 p-0 md:min-w-xl lg:min-w-4xl xl:min-w-5xl">
        {/* Sticky Header */}
        <div className="bg-background sticky top-0 z-10 flex-shrink-0 border-b px-6 py-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* Title */}
              <DialogTitle className="text-2xl leading-tight font-bold">
                {agreement.title || 'Agreement Details'}
              </DialogTitle>

              {/* Status Badge */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'px-3 py-1 text-xs whitespace-nowrap',
                    statusColors[agreement.status]
                  )}
                >
                  <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                  {formatAgreementStatusLabel(agreement.status)}
                </Badge>

                {/* Cancel Button - only for non-finalized/non-cancelled agreements */}
                {isCreator &&
                  agreement.status !== 'finalized' &&
                  agreement.status !== 'cancelled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700"
                      onClick={handleCancelClick}
                      disabled={isCancelling}
                      title="Cancel agreement"
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      {isCancelling ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  )}
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onOpenChange(false)}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="mt-5 space-y-8">
            {/* Agreement Link - Show when waiting for participant */}
            {agreement.status === 'waiting_for_participant' && (
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
                    agreement before it can proceed. You can share it via email,
                    messaging apps, or any other method.
                  </p>
                </div>
              </div>
            )}

            {/* Go to Agreement Page Button - For In Progress, Waiting, and Both Joined Statuses */}
            {(agreement.status === 'in-progress' ||
              agreement.status === 'waiting_for_participant') && (
              <Button variant="default" className="w-full" size="lg" asChild>
                <Link
                  href={
                    agreement.status === 'in-progress'
                      ? `/agreement/${agreement.id}/active`
                      : agreement.status === 'waiting_for_participant' &&
                          agreement.participants.length >= 2
                        ? `/agreement/configure?id=${agreement.id}`
                        : `/agreement/invite?id=${agreement.id}`
                  }
                  className="flex items-center justify-center gap-2"
                >
                  Go to Agreement
                  <ArrowUpRight className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* View Agreement Button - For Finalized Agreements */}
            {agreement.status === 'finalized' && (
              <Button variant="default" className="w-full" size="lg" asChild>
                <Link
                  href={`/agreement/${agreement.id}`}
                  className="flex items-center justify-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Agreement
                </Link>
              </Button>
            )}

            {/* Details Grid */}
            <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4">
              {/* Status */}
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Status
                </p>
                <p className="font-semibold">
                  {formatAgreementStatusLabel(agreement.status)}
                </p>
              </div>

              {/* Type */}
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Type
                </p>
                <p className="font-semibold">{agreement.agreement_type}</p>
              </div>

              {/* Created */}
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Created
                </p>
                <p className="font-semibold">
                  {formatDate(agreement.created_at)}
                </p>
              </div>

              {/* Participants */}
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Participants
                </p>
                <p className="font-semibold">{agreement.participants.length}</p>
              </div>
            </div>

            {/* Participants Section */}
            {agreement.participants && agreement.participants.length > 1 && (
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
                  {agreement.participants
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
                          {participant.has_confirmed && (
                            <Badge
                              variant="outline"
                              className="mt-1 border-green-500/20 bg-green-500/10 text-xs text-green-600"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Confirmed
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Description/Notes */}
            {agreement.description && (
              <div className="space-y-3">
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground bg-muted/50 rounded-lg p-3 text-sm">
                  {agreement.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Contact Counterparty */}
              {agreement.participants && agreement.participants.length > 1 && (
                <Button variant="outline" className="flex-1" asChild>
                  <Link
                    href={`mailto:${agreement.participants[1].participant_email || agreement.participants[1].email}`}
                    className="flex h-12 items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Contact Counterparty
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Cancel Alert Dialog */}
      <AlertDialog open={showCancelAlert} onOpenChange={setShowCancelAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Agreement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this agreement? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAgreement}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, cancel agreement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
