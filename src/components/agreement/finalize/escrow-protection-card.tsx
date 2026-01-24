'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info, AlertCircle } from 'lucide-react';
import type { EscrowType } from '@/types/escrow';

interface EscrowProtectionCardProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onEscrowDataChange: (data: EscrowData) => void;
  agreementTitle?: string;
  agreementTerms?: string; // Auto-infer deliverable from this
}

export interface EscrowData {
  type: EscrowType;
  deliverable_description: string;
  amount?: number;
  currency: string;
  expected_completion_date?: string;
  verification_required: boolean;
  arbiter_required: boolean;
}

const ESCROW_TYPES: { value: EscrowType; label: string }[] = [
  { value: 'cash', label: 'Cash Transaction' },
  { value: 'item', label: 'Physical Item' },
  { value: 'service', label: 'Service Delivery' },
  { value: 'digital', label: 'Digital Deliverable' },
  { value: 'document', label: 'Document/Papers' },
  { value: 'mixed', label: 'Mixed' },
];

/**
 * Extract deliverable information from agreement terms
 * Uses simple keyword matching and heuristics
 * In production, this could use AI/NLP for better extraction
 */
function extractDeliverableFromTerms(terms: string, title?: string): string {
  // Look for common deliverable keywords
  const deliverableKeywords = [
    'deliver',
    'provide',
    'supply',
    'complete',
    'perform',
    'transfer',
    'payment',
    'goods',
    'services',
    'work',
  ];

  // Find sentences containing deliverable keywords
  const sentences = terms.split(/[.!?]+/);
  const deliverableSentences = sentences.filter((sentence) => {
    const lower = sentence.toLowerCase();
    return deliverableKeywords.some((keyword) => lower.includes(keyword));
  });

  // If we found relevant sentences, use the first few
  if (deliverableSentences.length > 0) {
    return (
      deliverableSentences
        .slice(0, 2) // Take first 2 relevant sentences
        .join('. ')
        .trim() + '.'
    );
  }

  // Fallback: use title or first part of terms
  if (title) {
    return `As per agreement: ${title}`;
  }

  // Last resort: use first sentence
  return sentences[0]?.trim() + '.' || 'As specified in the agreement terms';
}

/**
 * EscrowProtectionCard Component
 *
 * Optional add-on card for agreement finalization that enables escrow protection.
 * Includes option for arbiter-based escrow (special version with pre-assigned arbiter).
 *
 * Features:
 * - Toggle to enable/disable escrow
 * - Escrow type selection
 * - Deliverable description
 * - Optional amount and completion date
 * - Verification requirement
 * - Arbiter requirement (special escrow version)
 */
export function EscrowProtectionCard({
  enabled,
  onEnabledChange,
  onEscrowDataChange,
  agreementTitle,
  agreementTerms,
}: EscrowProtectionCardProps) {
  // Auto-infer deliverable from agreement terms
  const inferredDeliverable = agreementTerms
    ? extractDeliverableFromTerms(agreementTerms, agreementTitle)
    : '';

  const [escrowData, setEscrowData] = useState<EscrowData>({
    type: 'service',
    deliverable_description: inferredDeliverable,
    currency: 'USD',
    verification_required: false,
    arbiter_required: false,
  });

  // Update deliverable when agreement terms change
  useEffect(() => {
    if (inferredDeliverable && !escrowData.deliverable_description) {
      setEscrowData((prev) => {
        const updated = {
          ...prev,
          deliverable_description: inferredDeliverable,
        };
        onEscrowDataChange(updated);
        return updated;
      });
    }
  }, [
    inferredDeliverable,
    escrowData.deliverable_description,
    onEscrowDataChange,
  ]);

  const handleDataChange = (updates: Partial<EscrowData>) => {
    const newData = { ...escrowData, ...updates };
    setEscrowData(newData);
    onEscrowDataChange(newData);
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Escrow Protection</h3>
              <p className="text-muted-foreground text-sm">
                Optional secure holding until completion
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            aria-label="Enable escrow protection"
          />
        </div>
      </div>

      {enabled && (
        <div className="space-y-6">
          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Escrow ensures deliverables are held securely until both parties
              confirm completion. This adds an extra layer of protection to your
              agreement.
            </AlertDescription>
          </Alert>

          {/* Escrow Type */}
          <div className="space-y-2">
            <Label htmlFor="escrow-type">
              Deliverable Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={escrowData.type}
              onValueChange={(value) =>
                handleDataChange({ type: value as EscrowType })
              }
            >
              <SelectTrigger id="escrow-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESCROW_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deliverable Description */}
          <div className="space-y-2">
            <Label htmlFor="deliverable">
              Deliverable Description{' '}
              <span className="text-destructive">*</span>
            </Label>
            {inferredDeliverable && (
              <p className="text-xs text-blue-600">
                ✨ Auto-inferred from agreement terms (you can edit if needed)
              </p>
            )}
            <Textarea
              id="deliverable"
              placeholder="Describe what needs to be delivered or completed..."
              value={escrowData.deliverable_description}
              onChange={(e) =>
                handleDataChange({ deliverable_description: e.target.value })
              }
              rows={3}
              required
            />
            <p className="text-muted-foreground text-xs">
              Be specific about what constitutes successful completion.
            </p>
          </div>

          {/* Amount and Currency */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="amount">Transaction Amount (Optional)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={escrowData.amount || ''}
                onChange={(e) =>
                  handleDataChange({
                    amount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={escrowData.currency}
                onValueChange={(value) => handleDataChange({ currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="PHP">PHP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expected Completion Date */}
          <div className="space-y-2">
            <Label htmlFor="completion-date">
              Expected Completion Date (Optional)
            </Label>
            <Input
              id="completion-date"
              type="date"
              value={escrowData.expected_completion_date || ''}
              onChange={(e) =>
                handleDataChange({ expected_completion_date: e.target.value })
              }
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Verification Required */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="verification">
                  Require Identity Verification
                </Label>
                <p className="text-muted-foreground text-sm">
                  Both parties must be verified to participate
                </p>
              </div>
              <Switch
                id="verification"
                checked={escrowData.verification_required}
                onCheckedChange={(checked) =>
                  handleDataChange({ verification_required: checked })
                }
              />
            </div>

            {/* Arbiter Required (Special Escrow Version) */}
            <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="space-y-0.5">
                <Label htmlFor="arbiter" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  Include Arbiter Oversight
                </Label>
                <p className="text-muted-foreground text-sm">
                  Both parties will select and agree on an arbiter
                </p>
              </div>
              <Switch
                id="arbiter"
                checked={escrowData.arbiter_required}
                onCheckedChange={(checked) =>
                  handleDataChange({ arbiter_required: checked })
                }
              />
            </div>
          </div>

          {/* Arbiter Info */}
          {escrowData.arbiter_required && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Arbiter Escrow:</strong> Both parties must propose and
                agree on an independent arbiter who will oversee this escrow
                from the beginning. The arbiter can intervene at any time if
                issues arise. Recommended for high-value or high-risk
                agreements.
                <br />
                <br />
                <strong>Note:</strong> You&apos;ll select the arbiter together
                after confirming the agreement.
              </AlertDescription>
            </Alert>
          )}

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="mb-2 text-sm font-semibold">Escrow Summary:</h4>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>
                • <strong>Type:</strong>{' '}
                {ESCROW_TYPES.find((t) => t.value === escrowData.type)?.label}
              </li>
              {escrowData.amount && (
                <li>
                  • <strong>Amount:</strong> {escrowData.currency}{' '}
                  {escrowData.amount.toFixed(2)}
                </li>
              )}
              <li>
                • <strong>Verification:</strong>{' '}
                {escrowData.verification_required ? 'Required' : 'Optional'}
              </li>
              <li>
                • <strong>Arbiter:</strong>{' '}
                {escrowData.arbiter_required
                  ? 'Pre-assigned (Special Escrow)'
                  : 'Available on request'}
              </li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
