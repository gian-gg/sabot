'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { CreateEscrowPayload, EscrowType } from '@/types/escrow';
import { Loader2, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

const ESCROW_TYPES: {
  value: EscrowType;
  label: string;
  description: string;
}[] = [
  {
    value: 'cash',
    label: 'Cash Transaction',
    description: 'Monetary exchange between parties',
  },
  {
    value: 'item',
    label: 'Physical Item',
    description: 'Exchange of physical goods',
  },
  {
    value: 'service',
    label: 'Service Delivery',
    description: 'Service or work to be completed',
  },
  {
    value: 'digital',
    label: 'Digital Deliverable',
    description: 'Digital goods or assets',
  },
  {
    value: 'document',
    label: 'Document/Papers',
    description: 'Legal documents or papers',
  },
  {
    value: 'mixed',
    label: 'Mixed',
    description: 'Multiple types of deliverables',
  },
];

/**
 * CreateEscrowForm Component
 *
 * Form for creating a new escrow transaction.
 * Collects all necessary information and submits to API.
 *
 * Features:
 * - Type selection
 * - Amount and currency
 * - Deliverable description
 * - Expected completion date
 * - Verification requirement toggle
 * - Optional participant invitation
 */
export function CreateEscrowForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state (simplified for UI, will be transformed to CreateEscrowPayload)
  const [formData, setFormData] = useState({
    type: 'item' as EscrowType,
    title: '',
    description: '',
    deliverable_description: '',
    amount: undefined as number | undefined,
    currency: 'USD',
    expected_completion_date: '',
    verification_required: false,
    participant_email: '',
  });

  const handleInputChange = (
    field: string,
    value: string | number | boolean | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!formData.title || !formData.deliverable_description) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      // Transform form data to CreateEscrowPayload
      const payload: CreateEscrowPayload = {
        title: formData.title,
        description: formData.description,
        deliverables: [
          {
            id: crypto.randomUUID(),
            escrow_id: '', // Will be set when creating escrow
            type: formData.type,
            description: formData.deliverable_description,
            party_responsible: 'participant',
            value: formData.amount,
            currency: formData.currency,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        expected_completion_date:
          formData.expected_completion_date || undefined,
        participant_email: formData.participant_email || undefined,
      };

      const response = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details || data.error || 'Failed to create escrow'
        );
      }

      setSuccess(true);

      // Redirect to the escrow page after a brief delay
      setTimeout(() => {
        router.push(`/escrow/${data.escrow.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create escrow');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-12">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
          <h2 className="text-2xl font-bold">Escrow Created Successfully!</h2>
          <p className="text-muted-foreground text-center">
            Redirecting you to your new escrow...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Create New Escrow
        </CardTitle>
        <CardDescription>
          Set up a secure escrow transaction with clear terms and deliverables.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Escrow Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Escrow Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select escrow type" />
              </SelectTrigger>
              <SelectContent>
                {ESCROW_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-muted-foreground text-xs">
                        {type.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Laptop Purchase Escrow"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide additional context about this escrow..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Amount */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="amount">Amount (Optional)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={(e) =>
                  handleInputChange(
                    'amount',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
                disabled={isSubmitting}
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

          {/* Deliverable Description */}
          <div className="space-y-2">
            <Label htmlFor="deliverable_description">
              Deliverable Description{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="deliverable_description"
              placeholder="Describe what needs to be delivered or completed..."
              value={formData.deliverable_description}
              onChange={(e) =>
                handleInputChange('deliverable_description', e.target.value)
              }
              disabled={isSubmitting}
              rows={4}
              required
            />
            <p className="text-muted-foreground text-xs">
              Be specific about what constitutes successful completion.
            </p>
          </div>

          {/* Expected Completion Date */}
          <div className="space-y-2">
            <Label htmlFor="expected_completion_date">
              Expected Completion Date (Optional)
            </Label>
            <Input
              id="expected_completion_date"
              type="date"
              value={formData.expected_completion_date}
              onChange={(e) =>
                handleInputChange('expected_completion_date', e.target.value)
              }
              disabled={isSubmitting}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Verification Required */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="verification_required">
                Require Identity Verification
              </Label>
              <p className="text-muted-foreground text-sm">
                Both parties must be verified to participate
              </p>
            </div>
            <Switch
              id="verification_required"
              checked={formData.verification_required}
              onCheckedChange={(checked) =>
                handleInputChange('verification_required', checked)
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Participant Email */}
          <div className="space-y-2">
            <Label htmlFor="participant_email">
              Invite Participant (Optional)
            </Label>
            <Input
              id="participant_email"
              type="email"
              placeholder="participant@example.com"
              value={formData.participant_email}
              onChange={(e) =>
                handleInputChange('participant_email', e.target.value)
              }
              disabled={isSubmitting}
            />
            <p className="text-muted-foreground text-xs">
              Send an invitation email to a specific participant, or share the
              link later.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Escrow...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Create Escrow
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
