'use client';

import { use, useEffect, useState } from 'react';
import { PageHeader } from '@/components/core/page-header';
import { EscrowDetailsCard } from '@/components/escrow/escrow-details-card';
import { EscrowTimeline } from '@/components/escrow/escrow-timeline';
import { ConfirmCompletionModal } from '@/components/escrow/confirm-completion-modal';
import { RequestArbiterModal } from '@/components/escrow/request-arbiter-modal';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import type { EscrowStatusResponse } from '@/types/escrow';
import { CheckCircle2, Shield, AlertCircle, Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface EscrowPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Escrow Detail Page
 *
 * Displays comprehensive information about a specific escrow transaction.
 * Allows users to:
 * - View escrow details and status
 * - See timeline of events
 * - Confirm completion
 * - Request arbiter for disputes
 * - Share/copy escrow link
 */
export default function EscrowPage({ params }: EscrowPageProps) {
  const { id } = use(params);

  const [data, setData] = useState<EscrowStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [arbiterModalOpen, setArbiterModalOpen] = useState(false);

  // Fetch escrow data
  useEffect(() => {
    async function fetchEscrow() {
      try {
        const response = await fetch(`/api/escrow/${id}/status`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || 'Failed to fetch escrow');
        }

        const escrowData = await response.json();
        setData(escrowData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load escrow');
      } finally {
        setLoading(false);
      }
    }

    fetchEscrow();
  }, [id]);

  // Handle confirmation
  const handleConfirm = async (notes?: string) => {
    try {
      const response = await fetch('/api/escrow/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrow_id: id,
          confirmation_notes: notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || 'Failed to confirm completion');
      }

      toast.success(result.message || 'Completion confirmed successfully');

      // Refresh data
      setLoading(true);
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm');
      throw err;
    }
  };

  // Handle arbiter request
  const handleRequestArbiter = async (reason: string, details: string) => {
    try {
      const response = await fetch('/api/escrow/request-arbiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrow_id: id,
          dispute_reason: reason,
          dispute_details: details,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || 'Failed to request arbiter');
      }

      toast.success(result.message || 'Arbiter requested successfully');

      // Refresh data
      setLoading(true);
      window.location.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to request arbiter'
      );
      throw err;
    }
  };

  // Handle share/copy link
  const handleCopyLink = async () => {
    const link = `${window.location.origin}/escrow/${id}`;

    try {
      await navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    const link = `${window.location.origin}/escrow/${id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.escrow.title || 'Escrow Transaction',
          text: 'Join this escrow transaction',
          url: link,
        });
      } catch {
        // User cancelled or error - fall back to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <PageHeader showBackButton backButtonFallback="/home" />
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <PageHeader showBackButton backButtonFallback="/home" />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Failed to load escrow'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { escrow, events, current_user_role, can_confirm, can_dispute } = data;

  const isOtherPartyConfirmed =
    current_user_role === 'initiator'
      ? escrow.participant_confirmation === 'confirmed'
      : escrow.initiator_confirmation === 'confirmed';

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <PageHeader showBackButton backButtonFallback="/home" />

      <div className="space-y-6">
        {/* Alert for pending participant */}
        {escrow.status === 'pending' && !escrow.participant && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This escrow is waiting for a participant to join. Share the link
              below to invite someone.
            </AlertDescription>
          </Alert>
        )}

        {/* Alert for awaiting confirmation */}
        {escrow.status === 'awaiting_confirmation' &&
          current_user_role &&
          can_confirm && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                {isOtherPartyConfirmed
                  ? 'The other party has confirmed completion. Please review and confirm if you agree.'
                  : "You've confirmed completion. Waiting for the other party to confirm."}
              </AlertDescription>
            </Alert>
          )}

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column - Details */}
          <div className="lg:col-span-2">
            <EscrowDetailsCard
              escrow={escrow}
              currentUserRole={current_user_role}
            />
          </div>

          {/* Right column - Actions & Timeline */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="space-y-3">
              {can_confirm && (
                <Button
                  className="w-full"
                  onClick={() => setConfirmModalOpen(true)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Confirm Completion
                </Button>
              )}

              {can_dispute && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setArbiterModalOpen(true)}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Request Arbiter
                </Button>
              )}

              {escrow.status === 'pending' &&
                current_user_role === 'initiator' && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleShare}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Escrow
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCopyLink}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                  </>
                )}
            </div>

            {/* Timeline */}
            <EscrowTimeline events={events} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmCompletionModal
        open={confirmModalOpen}
        onOpenChange={setConfirmModalOpen}
        onConfirm={handleConfirm}
        escrowTitle={escrow.title}
        isOtherPartyConfirmed={isOtherPartyConfirmed}
      />

      <RequestArbiterModal
        open={arbiterModalOpen}
        onOpenChange={setArbiterModalOpen}
        onRequest={handleRequestArbiter}
        escrowTitle={escrow.title}
      />
    </div>
  );
}
