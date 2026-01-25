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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Loader2, Info } from 'lucide-react';

interface RequestArbiterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequest: (reason: string, details: string) => Promise<void>;
  escrowTitle: string;
}

const DISPUTE_REASONS = [
  {
    value: 'non_delivery',
    label: 'Deliverable not received',
  },
  {
    value: 'incorrect_item',
    label: 'Incorrect or misrepresented item',
  },
  {
    value: 'quality_issues',
    label: 'Quality does not match description',
  },
  {
    value: 'incomplete_service',
    label: 'Service incomplete or unsatisfactory',
  },
  {
    value: 'terms_violation',
    label: 'Terms of agreement violated',
  },
  {
    value: 'fraud_suspected',
    label: 'Suspected fraud or scam',
  },
  {
    value: 'other',
    label: 'Other issue',
  },
];

/**
 * RequestArbiterModal Component
 *
 * Modal dialog for requesting arbiter intervention in an escrow dispute.
 * User must provide a reason and detailed explanation of the issue.
 *
 * @param open - Whether the modal is open
 * @param onOpenChange - Callback to change open state
 * @param onRequest - Async callback when user requests arbiter
 * @param escrowTitle - Title of the escrow for display
 */
export function RequestArbiterModal({
  open,
  onOpenChange,
  onRequest,
  escrowTitle,
}: RequestArbiterModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async () => {
    // Validation
    if (!reason) {
      setError('Please select a dispute reason');
      return;
    }

    if (!details || details.trim().length < 20) {
      setError('Please provide detailed explanation (minimum 20 characters)');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onRequest(reason, details);
      // Reset state on success
      setReason('');
      setDetails('');
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to request arbiter'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    setDetails('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <Shield className="h-5 w-5" />
            Request Arbiter
          </DialogTitle>
          <DialogDescription>
            Request an independent arbiter to review and resolve this dispute
            for &quot;{escrowTitle}&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              An arbiter will review the case and make a binding decision. Both
              parties will have the opportunity to present evidence and their
              side of the story.
            </AlertDescription>
          </Alert>

          {/* Dispute Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Dispute Reason <span className="text-destructive">*</span>
            </Label>
            <Select
              value={reason}
              onValueChange={setReason}
              disabled={isSubmitting}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detailed Explanation */}
          <div className="space-y-2">
            <Label htmlFor="details">
              Detailed Explanation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="details"
              placeholder="Provide a detailed explanation of the issue. Include specific dates, communications, and any relevant information that will help the arbiter understand the situation..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={6}
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground text-xs">
              Minimum 20 characters. Be as specific as possible.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Important Notice */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Important Information
            </h4>
            <ul className="space-y-1 text-xs text-amber-700">
              <li>
                • The arbiter&apos;s decision is{' '}
                <strong>final and binding</strong>
              </li>
              <li>
                • You will be notified when an arbiter is assigned to your case
              </li>
              <li>
                • Both parties will be able to submit evidence and statements
              </li>
              <li>• Review typically takes 3-5 business days</li>
              <li>
                • Malicious or false disputes may result in account penalties
              </li>
            </ul>
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
          <Button
            variant="destructive"
            onClick={handleRequest}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Requesting...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Request Arbiter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
