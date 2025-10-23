'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ConfirmCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (notes?: string) => Promise<void>;
  escrowTitle: string;
  isOtherPartyConfirmed: boolean;
}

/**
 * ConfirmCompletionModal Component
 *
 * Modal dialog for confirming completion of an escrow deliverable.
 * Allows user to add optional notes about the completion.
 * Shows different messaging based on whether the other party has confirmed.
 *
 * @param open - Whether the modal is open
 * @param onOpenChange - Callback to change open state
 * @param onConfirm - Async callback when user confirms (receives optional notes)
 * @param escrowTitle - Title of the escrow for display
 * @param isOtherPartyConfirmed - Whether the other party has already confirmed
 */
export function ConfirmCompletionModal({
  open,
  onOpenChange,
  onConfirm,
  escrowTitle,
  isOtherPartyConfirmed,
}: ConfirmCompletionModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm(notes || undefined);
      // Reset state on success
      setNotes('');
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to confirm completion'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNotes('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Confirm Completion
          </DialogTitle>
          <DialogDescription>
            Confirm that the deliverables for &quot;{escrowTitle}&quot; have
            been completed satisfactorily.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Information Alert */}
          {isOtherPartyConfirmed ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                The other party has already confirmed completion. Once you
                confirm, the escrow will be released immediately.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your confirmation will be recorded. The escrow will be released
                once both parties confirm completion.
              </AlertDescription>
            </Alert>
          )}

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Confirmation Notes{' '}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about the completion..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground text-xs">
              These notes will be recorded in the escrow timeline.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Warning */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Important:</strong> By confirming, you acknowledge that
              you have received the agreed deliverables and are satisfied with
              the transaction.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Confirm Completion
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
