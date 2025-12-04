'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  getDeliverableTypeConfig,
  getOracleTypeConfig,
} from '@/lib/escrow/deliverable-status';
import type { Deliverable } from '@/types/escrow';
import { AlertCircle, Loader2, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface SubmitProofDialogProps {
  deliverable: Deliverable;
  onProofSubmitted?: () => void;
  children: React.ReactNode;
}

export function SubmitProofDialog({
  deliverable,
  onProofSubmitted,
  children,
}: SubmitProofDialogProps) {
  const [open, setOpen] = useState(false);
  const [proofHash, setProofHash] = useState('');
  const [proofDescription, setProofDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oracleType = getOracleTypeForDeliverable(deliverable);
  const oracleConfig = getOracleTypeConfig(oracleType);
  const deliverableConfig = getDeliverableTypeConfig(deliverable.type);

  const handleSubmit = async () => {
    if (!proofHash.trim()) {
      setError('Proof hash is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/escrow/submit-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          escrow_id: deliverable.escrow_id,
          deliverable_id: deliverable.id,
          proof_hash: proofHash.trim(),
          proof_description: proofDescription.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit proof');
      }

      toast.success('Proof submitted successfully!', {
        description: data.oracle_triggered
          ? 'Oracle verification is in progress...'
          : 'Manual verification required.',
      });

      setOpen(false);
      setProofHash('');
      setProofDescription('');
      onProofSubmitted?.();
    } catch (error) {
      console.error('Error submitting proof:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to submit proof'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProofGuidance = () => {
    switch (deliverable.type) {
      case 'digital':
      case 'document':
        return {
          title: 'IPFS File Hash',
          description:
            'Upload your file to IPFS and provide the CID (Content Identifier)',
          placeholder: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
          example: 'Example: QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
          helpText:
            'Use services like Pinata, Infura, or local IPFS to upload your file and get the CID.',
        };
      case 'service':
        return {
          title: 'Service Completion Proof',
          description:
            'Provide evidence of service completion (screenshot, receipt, etc.)',
          placeholder: 'Service completion screenshot URL or description',
          example:
            'Example: https://example.com/screenshot.jpg or "Service completed as agreed"',
          helpText:
            'AI will analyze your proof against the service requirements.',
        };
      case 'cash':
      case 'digital_transfer':
        return {
          title: 'Payment Proof',
          description:
            'Provide proof of payment (receipt, transaction ID, etc.)',
          placeholder: 'Transaction ID or receipt number',
          example: 'Example: TXN123456789 or Receipt #ABC123',
          helpText: 'Include transaction details that can be verified.',
        };
      default:
        return {
          title: 'Proof of Delivery',
          description:
            'Provide evidence that the deliverable has been completed',
          placeholder: 'Proof description or reference',
          example: 'Example: Delivery confirmation #12345',
          helpText:
            'Provide any evidence that shows the deliverable has been completed.',
        };
    }
  };

  const guidance = getProofGuidance();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <>{children}</>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Submit Proof
          </DialogTitle>
          <DialogDescription>
            Submit proof for: <strong>{deliverable.description}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Deliverable Info */}
          <div className="bg-muted/50 rounded-lg border p-3">
            <div className="mb-2 flex items-center gap-2">
              {React.createElement(deliverableConfig.icon, {
                className: 'h-4 w-4 text-muted-foreground',
              })}
              <span className="text-sm font-medium">
                {deliverableConfig.label}
              </span>
              <Badge variant="outline" className="text-xs">
                {deliverable.party_responsible === 'initiator'
                  ? 'Initiator'
                  : 'Participant'}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {deliverable.description}
            </p>
            {deliverable.value && deliverable.currency && (
              <p className="text-sm font-medium text-green-600">
                {deliverable.currency} {deliverable.value.toLocaleString()}
              </p>
            )}
          </div>

          {/* Oracle Type Info */}
          <div className="flex items-center gap-2">
            {React.createElement(oracleConfig.icon, { className: 'h-4 w-4' })}
            <span className="text-sm font-medium">
              {oracleConfig.label} Verification
            </span>
            <Badge variant="secondary" className="text-xs">
              {oracleConfig.description}
            </Badge>
          </div>

          {/* Proof Input */}
          <div className="space-y-2">
            <Label htmlFor="proof-hash">{guidance.title}</Label>
            <Input
              id="proof-hash"
              placeholder={guidance.placeholder}
              value={proofHash}
              onChange={(e) => setProofHash(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground text-xs">{guidance.example}</p>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="proof-description">Description (Optional)</Label>
            <Textarea
              id="proof-description"
              placeholder="Additional details about your proof..."
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Help Text */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {guidance.helpText}
            </AlertDescription>
          </Alert>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !proofHash.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Proof
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to determine oracle type
function getOracleTypeForDeliverable(
  deliverable: Deliverable
): 'ipfs' | 'ai' | 'manual' {
  switch (deliverable.type) {
    case 'digital':
    case 'document':
      return 'ipfs';
    case 'service':
      return 'ai';
    default:
      return 'manual';
  }
}
