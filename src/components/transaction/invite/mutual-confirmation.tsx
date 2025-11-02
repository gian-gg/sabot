'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
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

interface MutualConfirmationProps {
  userId: string;
  participants: Array<{ id: string; name: string; isReady: boolean }>;
  isConnected: boolean;
  canProceed: boolean;
  onConfirm: (isReady: boolean) => void;
  onAllReady?: (isReady: boolean) => void;
  onRetryConnection?: () => void;
  otherPartyDisconnected?: boolean;
}

export function MutualConfirmation({
  userId,
  participants,
  isConnected,
  canProceed,
  onConfirm,
  onAllReady,
  onRetryConnection,
  otherPartyDisconnected = false,
}: MutualConfirmationProps) {
  const [isCurrentUserReady, setIsCurrentUserReady] = useState(false);
  const [showUnconfirmDialog, setShowUnconfirmDialog] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const previousAllReadyRef = useRef<boolean | null>(null);

  const otherPartyReady = participants.some(
    (p) => p.id !== userId && p.isReady
  );
  const allParticipantsReady =
    participants.length >= 2 && participants.every((p) => p.isReady);

  // Notify parent when all participants are ready - only when value actually changes
  useEffect(() => {
    if (onAllReady && previousAllReadyRef.current !== allParticipantsReady) {
      previousAllReadyRef.current = allParticipantsReady;
      onAllReady(allParticipantsReady);
    }
  }, [allParticipantsReady, onAllReady, participants]);

  const handleConfirm = () => {
    setIsCurrentUserReady(true);
    onConfirm(true);
    toast.success('You confirmed! Waiting for other party...');
  };

  const handleUnconfirmClick = () => {
    setShowUnconfirmDialog(true);
  };

  const handleUnconfirmConfirm = () => {
    setShowUnconfirmDialog(false);
    setIsCurrentUserReady(false);
    onConfirm(false);
    toast.info('Confirmation cancelled');
  };

  const handleRetryConnection = () => {
    setIsRetrying(true);
    toast.info('Attempting to reconnect...');

    // Call parent retry function if provided
    if (onRetryConnection) {
      onRetryConnection();
    }

    // Reset retry state after a delay
    setTimeout(() => {
      setIsRetrying(false);
    }, 2000);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Sync Status Indicator with Retry Button */}
        <div className="border-muted bg-muted/20 flex items-center justify-between rounded-lg border px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            {isConnected && !otherPartyDisconnected ? (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">
                  Synced with other party
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-destructive">Not synced</span>
              </>
            )}
          </div>

          {!isConnected && !otherPartyDisconnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetryConnection}
              disabled={isRetrying}
              className="h-7 px-2 text-xs"
            >
              <RefreshCw
                className={`mr-1 h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`}
              />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          )}
        </div>

        {/* Participant Status */}
        <div className="border-muted bg-muted/20 rounded-lg border p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">You</span>
              {isCurrentUserReady ? (
                <span className="flex items-center gap-1 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmed
                </span>
              ) : (
                <span className="text-muted-foreground">Waiting...</span>
              )}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Other party</span>
              {otherPartyReady ? (
                <span className="flex items-center gap-1 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmed
                </span>
              ) : (
                <span className="text-muted-foreground">Waiting...</span>
              )}
            </div>
          </div>
        </div>

        {/* Single Action Button */}
        {!isCurrentUserReady ? (
          <Button
            onClick={handleConfirm}
            disabled={!canProceed || !isConnected || otherPartyDisconnected}
            className="w-full"
            size="lg"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Confirm Selections
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleUnconfirmClick}
            disabled={!isConnected || otherPartyDisconnected}
            className="w-full"
            size="lg"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel Confirmation
          </Button>
        )}
      </div>

      {/* Unconfirm Dialog */}
      <AlertDialog
        open={showUnconfirmDialog}
        onOpenChange={setShowUnconfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Your Confirmation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your confirmation?
              {otherPartyReady &&
                ' The other party has already confirmed and will need to wait for you again.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep confirmation</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnconfirmConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, cancel confirmation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
