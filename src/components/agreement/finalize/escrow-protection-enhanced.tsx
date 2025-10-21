'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Plus, X, Sparkles } from 'lucide-react';
import type { EscrowType, Deliverable, PartyResponsible } from '@/types/escrow';

interface ItemDetails {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  condition: string;
}

interface EscrowProtectionEnhancedProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onEscrowDataChange: (data: EnhancedEscrowData) => void;
  agreementTitle?: string;
  agreementTerms?: string;
  itemDetails?: ItemDetails;
  initiatorId: string;
  participantId: string;
  initiatorName?: string; // Actual user name
  participantName?: string; // Actual user name
}

export interface EnhancedEscrowData {
  deliverables: Deliverable[]; // Separated by party, payment types have amounts
  expected_completion_date?: string;
  arbiter_required: boolean;
  arbiter_id?: string;
}

const DELIVERABLE_TYPES: { value: EscrowType; label: string }[] = [
  { value: 'service', label: 'Service' },
  { value: 'item', label: 'Physical Item' },
  { value: 'digital', label: 'Digital Asset' },
  { value: 'document', label: 'Document' },
  { value: 'cash', label: 'Cash Payment' },
  { value: 'digital_transfer', label: 'Digital Transfer' },
];

/**
 * Determine which party is responsible based on sentence context
 */
function determineResponsibleParty(sentence: string): PartyResponsible {
  const lower = sentence.toLowerCase();

  // Keywords that indicate initiator/seller/provider
  const initiatorKeywords = [
    'provide',
    'deliver',
    'supply',
    'transfer',
    'give',
    'seller',
    'developer',
    'freelancer',
    'provider',
  ];

  // Keywords that indicate participant/buyer/client
  const participantKeywords = [
    'pay',
    'payment',
    'purchase',
    'buyer',
    'client',
    'customer',
    'receive',
  ];

  const initiatorScore = initiatorKeywords.filter((kw) =>
    lower.includes(kw)
  ).length;
  const participantScore = participantKeywords.filter((kw) =>
    lower.includes(kw)
  ).length;

  return participantScore > initiatorScore ? 'participant' : 'initiator';
}

/**
 * Parse deliverables from structured item details
 */
function parseDeliverablesFromItemDetails(
  itemDetails: ItemDetails
): Deliverable[] {
  const deliverables: Deliverable[] = [];

  // Create item deliverable (seller provides item)
  deliverables.push({
    id: 'deliverable-item',
    type: 'item',
    description: `${itemDetails.name} - ${itemDetails.condition.replace('-', ' ')} condition. ${itemDetails.description}`,
    quantity: itemDetails.quantity,
    party_responsible: 'initiator', // Seller provides the item
  });

  // Create payment deliverable (buyer pays)
  deliverables.push({
    id: 'deliverable-payment',
    type: 'digital_transfer',
    description: `Payment for ${itemDetails.name}`,
    value: itemDetails.price,
    currency: 'PHP',
    party_responsible: 'participant', // Buyer pays
  });

  return deliverables;
}

/**
 * Parse agreement to extract deliverable information with amounts and party responsibility
 * Returns array of deliverables with auto-inferred types, values, currencies, and party
 */
function parseDeliverablesFromAgreement(
  terms: string,
  title?: string
): Deliverable[] {
  const deliverables: Deliverable[] = [];

  // Keywords for each type
  const typeKeywords = {
    service: [
      'service',
      'perform',
      'work',
      'complete',
      'develop',
      'design',
      'create',
    ],
    item: ['item', 'product', 'goods', 'equipment', 'material', 'deliver'],
    digital: [
      'software',
      'app',
      'website',
      'digital',
      'online',
      'code',
      'file',
    ],
    document: ['document', 'contract', 'certificate', 'paper', 'report'],
    cash: ['cash', 'payment', 'money'],
    digital_transfer: ['transfer', 'pay', 'bank', 'paypal', 'venmo', 'wire'],
  };

  // Split into sentences
  const sentences = terms.split(/[.!?]+/).filter((s) => s.trim().length > 20);

  // Look for deliverable indicators
  const deliverableKeywords = [
    'deliver',
    'provide',
    'supply',
    'complete',
    'transfer',
    'pay',
  ];

  sentences.forEach((sentence, index) => {
    const lower = sentence.toLowerCase();
    const hasDeliverableKeyword = deliverableKeywords.some((kw) =>
      lower.includes(kw)
    );

    if (hasDeliverableKeyword) {
      // Determine type based on keywords
      let type: EscrowType = 'service'; // default
      let maxMatches = 0;

      for (const [deliverableType, keywords] of Object.entries(typeKeywords)) {
        const matches = keywords.filter((kw) => lower.includes(kw)).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          type = deliverableType as EscrowType;
        }
      }

      // Extract amount from this specific sentence
      const amountInfo = extractAmountFromText(sentence);

      // Determine which party is responsible
      const party_responsible = determineResponsibleParty(sentence);

      deliverables.push({
        id: `deliverable-${index}`,
        type,
        description: sentence.trim(),
        value: amountInfo.amount,
        currency: amountInfo.currency,
        party_responsible,
      });
    }
  });

  // If no deliverables found, create one from title or first sentence
  if (deliverables.length === 0) {
    deliverables.push({
      id: 'deliverable-0',
      type: 'service',
      description: title || sentences[0]?.trim() || 'As specified in agreement',
      party_responsible: 'initiator', // Default to initiator
    });
  }

  return deliverables;
}

/**
 * Extract monetary amount from a text string (single sentence or full text)
 */
function extractAmountFromText(text: string): {
  amount?: number;
  currency?: string;
} {
  // Look for currency patterns
  const currencyPatterns = [
    { regex: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, currency: 'USD' },
    { regex: /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*USD/gi, currency: 'USD' },
    { regex: /€\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, currency: 'EUR' },
    { regex: /£\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, currency: 'GBP' },
    { regex: /₱\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, currency: 'PHP' },
    { regex: /PHP\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, currency: 'PHP' },
  ];

  for (const { regex, currency } of currencyPatterns) {
    const matches = Array.from(text.matchAll(regex));
    if (matches.length > 0) {
      // Get the first amount found in this text
      const amount = parseFloat(matches[0][1].replace(/,/g, ''));
      return { amount, currency };
    }
  }

  return {};
}

/**
 * Enhanced Escrow Protection Card
 *
 * Features:
 * - Auto-infers deliverable types and party responsibility
 * - Supports multiple deliverables separated by party
 * - Auto-infers amounts for payment deliverables only
 * - Cash and digital transfer as deliverable types
 * - Integrated arbiter selection (before finalization)
 */
export function EscrowProtectionEnhanced({
  enabled,
  onEnabledChange,
  onEscrowDataChange,
  agreementTitle,
  agreementTerms,
  itemDetails,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  initiatorId: _initiatorId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  participantId: _participantId,
  initiatorName,
  participantName,
}: EscrowProtectionEnhancedProps) {
  // Auto-infer from item details or agreement
  const inferredDeliverables = useMemo(() => {
    // Prefer structured item details if available
    if (itemDetails && itemDetails.name && itemDetails.price > 0) {
      return parseDeliverablesFromItemDetails(itemDetails);
    }
    // Fall back to parsing agreement text
    if (agreementTerms) {
      return parseDeliverablesFromAgreement(agreementTerms, agreementTitle);
    }
    return [];
  }, [itemDetails, agreementTerms, agreementTitle]);

  const [escrowData, setEscrowData] = useState<EnhancedEscrowData>({
    deliverables: inferredDeliverables,
    arbiter_required: false,
  });

  // Update when inferred values change
  useEffect(() => {
    if (
      inferredDeliverables.length > 0 &&
      escrowData.deliverables.length === 0
    ) {
      setEscrowData((prev) => {
        const updated = { ...prev, deliverables: inferredDeliverables };
        onEscrowDataChange(updated);
        return updated;
      });
    }
  }, [
    inferredDeliverables,
    escrowData.deliverables.length,
    onEscrowDataChange,
  ]);

  const handleDataChange = (updates: Partial<EnhancedEscrowData>) => {
    const newData = { ...escrowData, ...updates };
    setEscrowData(newData);
    onEscrowDataChange(newData);
  };

  const addDeliverable = (party: PartyResponsible) => {
    const newDeliverable: Deliverable = {
      id: `deliverable-${Date.now()}`,
      type: 'service',
      description: '',
      party_responsible: party,
    };
    handleDataChange({
      deliverables: [...escrowData.deliverables, newDeliverable],
    });
  };

  const removeDeliverable = (id: string) => {
    handleDataChange({
      deliverables: escrowData.deliverables.filter((d) => d.id !== id),
    });
  };

  const updateDeliverable = (id: string, updates: Partial<Deliverable>) => {
    handleDataChange({
      deliverables: escrowData.deliverables.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    });
  };

  const hasInferredData = inferredDeliverables.length > 0;

  return (
    <div>
      <div className="bg-muted/30 border-b p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Escrow Protection</h3>
              <p className="text-muted-foreground text-sm">
                Secure holding until deliverables are completed
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            aria-label="Enable escrow protection"
            className="ring-1 ring-green-200 ring-offset-1 data-[state=checked]:bg-green-600 data-[state=checked]:ring-blue-400 dark:ring-green-800"
          />
        </div>
      </div>

      {enabled && (
        <div className="max-h-[600px] overflow-auto [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-green-500 [&::-webkit-scrollbar-thumb]:hover:bg-green-600 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800">
          <div className="space-y-6 px-6 py-6">
            {/* Info Alert */}
            {hasInferredData && (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Smart Escrow:</strong> We&apos;ve automatically
                  created deliverables from your item details - the item
                  you&apos;re selling and the payment. You can edit or add more
                  if needed.
                </AlertDescription>
              </Alert>
            )}

            {/* Deliverables - Separated by Party */}
            <div className="space-y-6">
              <Label className="text-base font-semibold">
                Deliverables <span className="text-destructive">*</span>
              </Label>

              {/* Initiator Deliverables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {initiatorName
                      ? `${initiatorName}'s Obligations`
                      : "Initiator's Obligations"}
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDeliverable('initiator')}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>

                {escrowData.deliverables
                  .filter((d) => d.party_responsible === 'initiator')
                  .map((deliverable, index) => (
                    <Card key={deliverable.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Deliverable {index + 1}
                          </span>
                          {escrowData.deliverables.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDeliverable(deliverable.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div
                            className={`space-y-2 ${deliverable.type === 'item' || deliverable.type === 'document' ? '' : 'sm:col-span-2'}`}
                          >
                            <Label htmlFor={`type-${deliverable.id}`}>
                              Type
                            </Label>
                            <Select
                              value={deliverable.type}
                              onValueChange={(value) =>
                                updateDeliverable(deliverable.id, {
                                  type: value as EscrowType,
                                })
                              }
                            >
                              <SelectTrigger id={`type-${deliverable.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DELIVERABLE_TYPES.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Quantity field - only for items and documents */}
                          {(deliverable.type === 'item' ||
                            deliverable.type === 'document') && (
                            <div className="space-y-2">
                              <Label htmlFor={`quantity-${deliverable.id}`}>
                                Quantity
                              </Label>
                              <Input
                                id={`quantity-${deliverable.id}`}
                                type="number"
                                min="1"
                                placeholder="1"
                                value={deliverable.quantity || ''}
                                onChange={(e) =>
                                  updateDeliverable(deliverable.id, {
                                    quantity: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`desc-${deliverable.id}`}>
                            Description
                          </Label>
                          <Textarea
                            id={`desc-${deliverable.id}`}
                            placeholder="Describe what needs to be delivered..."
                            value={deliverable.description}
                            onChange={(e) =>
                              updateDeliverable(deliverable.id, {
                                description: e.target.value,
                              })
                            }
                            rows={2}
                          />
                        </div>

                        {/* Amount field - only for payment types */}
                        {(deliverable.type === 'cash' ||
                          deliverable.type === 'digital_transfer') && (
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor={`value-${deliverable.id}`}>
                                Amount{' '}
                                <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`value-${deliverable.id}`}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={deliverable.value || ''}
                                onChange={(e) =>
                                  updateDeliverable(deliverable.id, {
                                    value: e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`currency-${deliverable.id}`}>
                                Currency
                              </Label>
                              <Select
                                value={deliverable.currency || 'PHP'}
                                onValueChange={(value) =>
                                  updateDeliverable(deliverable.id, {
                                    currency: value,
                                  })
                                }
                              >
                                <SelectTrigger
                                  id={`currency-${deliverable.id}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PHP">PHP</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>

              {/* Participant Deliverables */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {participantName
                      ? `${participantName}'s Obligations`
                      : "Participant's Obligations"}
                  </h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDeliverable('participant')}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Add
                  </Button>
                </div>

                {escrowData.deliverables
                  .filter((d) => d.party_responsible === 'participant')
                  .map((deliverable, index) => (
                    <Card key={deliverable.id} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Deliverable {index + 1}
                          </span>
                          {escrowData.deliverables.filter(
                            (d) => d.party_responsible === 'participant'
                          ).length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDeliverable(deliverable.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div
                            className={`space-y-2 ${deliverable.type === 'item' || deliverable.type === 'document' ? '' : 'sm:col-span-2'}`}
                          >
                            <Label htmlFor={`type-${deliverable.id}`}>
                              Type
                            </Label>
                            <Select
                              value={deliverable.type}
                              onValueChange={(value) =>
                                updateDeliverable(deliverable.id, {
                                  type: value as EscrowType,
                                })
                              }
                            >
                              <SelectTrigger id={`type-${deliverable.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DELIVERABLE_TYPES.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Quantity field - only for items and documents */}
                          {(deliverable.type === 'item' ||
                            deliverable.type === 'document') && (
                            <div className="space-y-2">
                              <Label htmlFor={`quantity-${deliverable.id}`}>
                                Quantity
                              </Label>
                              <Input
                                id={`quantity-${deliverable.id}`}
                                type="number"
                                min="1"
                                placeholder="1"
                                value={deliverable.quantity || ''}
                                onChange={(e) =>
                                  updateDeliverable(deliverable.id, {
                                    quantity: e.target.value
                                      ? parseInt(e.target.value)
                                      : undefined,
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`desc-${deliverable.id}`}>
                            Description
                          </Label>
                          <Textarea
                            id={`desc-${deliverable.id}`}
                            placeholder="Describe what needs to be delivered..."
                            value={deliverable.description}
                            onChange={(e) =>
                              updateDeliverable(deliverable.id, {
                                description: e.target.value,
                              })
                            }
                            rows={2}
                          />
                        </div>

                        {/* Amount field - only for payment types */}
                        {(deliverable.type === 'cash' ||
                          deliverable.type === 'digital_transfer') && (
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor={`value-${deliverable.id}`}>
                                Amount{' '}
                                <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id={`value-${deliverable.id}`}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={deliverable.value || ''}
                                onChange={(e) =>
                                  updateDeliverable(deliverable.id, {
                                    value: e.target.value
                                      ? parseFloat(e.target.value)
                                      : undefined,
                                  })
                                }
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`currency-${deliverable.id}`}>
                                Currency
                              </Label>
                              <Select
                                value={deliverable.currency || 'PHP'}
                                onValueChange={(value) =>
                                  updateDeliverable(deliverable.id, {
                                    currency: value,
                                  })
                                }
                              >
                                <SelectTrigger
                                  id={`currency-${deliverable.id}`}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PHP">PHP</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                  <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            </div>

            {/* Expected Completion Date */}
            <div className="space-y-2">
              <Label
                htmlFor="completion-date"
                className="text-muted-foreground"
              >
                Expected Completion Date{' '}
                <span className="text-xs">(Optional)</span>
              </Label>
              <Input
                id="completion-date"
                type="date"
                value={escrowData.expected_completion_date || ''}
                onChange={(e) =>
                  handleDataChange({
                    expected_completion_date: e.target.value,
                  })
                }
                min={new Date().toISOString().split('T')[0]}
                placeholder="Select a date..."
              />
              <p className="text-muted-foreground text-xs">
                Set a deadline for when deliverables should be completed
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
