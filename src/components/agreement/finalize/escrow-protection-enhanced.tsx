'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Deliverable, EscrowType, PartyResponsible } from '@/types/escrow';
import { useSharedConflictResolution } from '@/hooks/use-shared-conflict-resolution';
import {
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  Monitor,
  Package,
  Plus,
  Shield,
  Smartphone,
  Users,
  Wrench,
  X,
  AlertTriangle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
  onEscrowDataChange: (data: EnhancedEscrowData) => void;
  agreementTitle?: string;
  agreementTerms?: string;
  itemDetails?: ItemDetails;
  initiatorId: string;
  participantId: string;
  initiatorName?: string;
  participantName?: string;
  conflictResolution?: ReturnType<typeof useSharedConflictResolution>;
  currentUserId?: string;
  currentStep?: number;
}

export interface EnhancedEscrowData {
  deliverables: Deliverable[];
  expected_completion_date?: string;
  arbiter_required: boolean;
  arbiter_id?: string;
}

const DELIVERABLE_TYPES = [
  {
    value: 'service',
    label: 'Service',
    icon: Wrench,
    description: 'Work, consulting, maintenance',
    requiresArbiter: true,
    color:
      'bg-blue-50 border-blue-200 text-blue-800
  },
  {
    value: 'item',
    label: 'Physical Item',
    icon: Package,
    description: 'Goods, products, merchandise',
    requiresArbiter: true,
    color:
      'bg-green-50 border-green-200 text-green-800
  },
  {
    value: 'digital',
    label: 'Digital Asset',
    icon: Monitor,
    description: 'Files, software, digital content',
    requiresArbiter: false,
    color:
      'bg-purple-50 border-purple-200 text-purple-800
  },
  {
    value: 'document',
    label: 'Document',
    icon: FileText,
    description: 'Papers, certificates, contracts',
    requiresArbiter: true,
    color:
      'bg-orange-50 border-orange-200 text-orange-800
  },
  {
    value: 'cash',
    label: 'Cash Payment',
    icon: CreditCard,
    description: 'Physical cash transactions',
    requiresArbiter: true,
    color:
      'bg-red-50 border-red-200 text-red-800
  },
  {
    value: 'digital_transfer',
    label: 'Digital Transfer',
    icon: Smartphone,
    description: 'Online payments, transfers',
    requiresArbiter: false,
    color:
      'bg-cyan-50 border-cyan-200 text-cyan-800
  },
];

function shouldRequireArbiter(deliverables: Deliverable[]): boolean {
  return deliverables.some(
    (deliverable) =>
      deliverable.type === 'service' ||
      deliverable.type === 'item' ||
      deliverable.type === 'document' ||
      deliverable.type === 'cash'
  );
}

// Cache for deliverable type inferences
const deliverableTypeCache = new Map<string, EscrowType>();

async function inferDeliverableType(
  itemDetails: ItemDetails
): Promise<EscrowType> {
  // Create cache key from item details
  const cacheKey =
    `${itemDetails.name}|${itemDetails.description}|${itemDetails.category}`.toLowerCase();

  // Check cache first
  if (deliverableTypeCache.has(cacheKey)) {
    return deliverableTypeCache.get(cacheKey)!;
  }

  // Try keyword matching first to avoid API calls
  const text =
    `${itemDetails.name} ${itemDetails.description} ${itemDetails.category}`.toLowerCase();

  if (
    text.includes('cash') ||
    text.includes('money') ||
    text.includes('peso')
  ) {
    const result = 'cash';
    deliverableTypeCache.set(cacheKey, result);
    return result;
  }
  if (
    text.includes('payment') ||
    text.includes('transfer') ||
    text.includes('gcash')
  ) {
    const result = 'digital_transfer';
    deliverableTypeCache.set(cacheKey, result);
    return result;
  }
  if (
    text.includes('document') ||
    text.includes('certificate') ||
    text.includes('license')
  ) {
    const result = 'document';
    deliverableTypeCache.set(cacheKey, result);
    return result;
  }
  if (
    text.includes('digital') ||
    text.includes('software') ||
    text.includes('app')
  ) {
    const result = 'digital';
    deliverableTypeCache.set(cacheKey, result);
    return result;
  }
  if (
    text.includes('service') ||
    text.includes('repair') ||
    text.includes('cleaning')
  ) {
    const result = 'service';
    deliverableTypeCache.set(cacheKey, result);
    return result;
  }

  // Only use AI for ambiguous cases
  try {
    const response = await fetch('/api/ai/infer-deliverable-type', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemName: itemDetails.name,
        itemDescription: itemDetails.description,
        category: itemDetails.category,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to infer deliverable type');
    }

    const data = await response.json();
    const result = data.deliverableType as EscrowType;
    deliverableTypeCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error inferring deliverable type:', error);
    // Default to item for physical goods
    const result = 'item';
    deliverableTypeCache.set(cacheKey, result);
    return result;
  }
}

async function parseDeliverablesFromItemDetails(
  itemDetails: ItemDetails
): Promise<Deliverable[]> {
  const deliverables: Deliverable[] = [];

  const itemType = await inferDeliverableType(itemDetails);
  deliverables.push({
    id: `item-${Date.now()}`,
    escrow_id: '', // Will be set when creating escrow
    type: itemType,
    description: itemDetails.name,
    party_responsible: 'initiator',
    value: itemDetails.price,
    currency: 'PHP',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  deliverables.push({
    id: `payment-${Date.now() + 1}`,
    escrow_id: '', // Will be set when creating escrow
    type: 'digital_transfer',
    description: `Payment of ₱${itemDetails.price}`,
    party_responsible: 'participant',
    value: itemDetails.price,
    currency: 'PHP',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return deliverables;
}

function parseDeliverablesFromAgreement(
  agreementTerms: string,
  agreementTitle?: string
): Deliverable[] {
  const deliverables: Deliverable[] = [];

  const paymentMatch = agreementTerms.match(/\$(\d+(?:\.\d{2})?)/);
  if (paymentMatch) {
    const amount = parseFloat(paymentMatch[1]);
    deliverables.push({
      id: `payment-${Date.now()}`,
      escrow_id: '', // Will be set when creating escrow
      type: 'digital_transfer',
      description: `Payment of ₱${amount}`,
      party_responsible: 'participant',
      value: amount,
      currency: 'PHP',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  deliverables.push({
    id: `deliverable-${Date.now()}`,
    escrow_id: '', // Will be set when creating escrow
    type: 'service',
    description: agreementTitle || 'Service as specified in agreement',
    party_responsible: 'initiator',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return deliverables;
}

export function EscrowProtectionEnhanced({
  enabled,
  onEscrowDataChange,
  agreementTitle,
  agreementTerms,
  itemDetails,
  initiatorName,
  participantName,
  conflictResolution,
  currentUserId,
  currentStep,
}: EscrowProtectionEnhancedProps) {
  const [inferredDeliverables, setInferredDeliverables] = useState<
    Deliverable[]
  >([]);

  // Track debounce timer for syncing
  const debounceTimerRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadInferredDeliverables = async () => {
      if (itemDetails && itemDetails.name && itemDetails.price > 0) {
        const deliverables =
          await parseDeliverablesFromItemDetails(itemDetails);
        setInferredDeliverables(deliverables);
      } else if (agreementTerms) {
        const deliverables = parseDeliverablesFromAgreement(
          agreementTerms,
          agreementTitle
        );
        setInferredDeliverables(deliverables);
      } else {
        setInferredDeliverables([]);
      }
    };

    loadInferredDeliverables();
  }, [itemDetails, agreementTerms, agreementTitle]);

  const [escrowData, setEscrowData] = useState<EnhancedEscrowData>({
    deliverables: inferredDeliverables,
    arbiter_required: shouldRequireArbiter(inferredDeliverables),
  });

  useEffect(() => {
    if (
      inferredDeliverables.length > 0 &&
      escrowData.deliverables.length === 0
    ) {
      setEscrowData((prev) => {
        const updated = { ...prev, deliverables: inferredDeliverables };
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          onEscrowDataChange(updated);
        }, 0);
        return updated;
      });
    }
  }, [
    inferredDeliverables,
    escrowData.deliverables.length,
    onEscrowDataChange,
  ]);

  // Sync escrow data changes from other party
  useEffect(() => {
    if (!conflictResolution || !currentUserId || currentStep !== 5) return;

    const sharedSelections = conflictResolution.sharedSelections;
    const selection =
      sharedSelections['escrowData' as keyof typeof sharedSelections];

    if (selection) {
      const escrowUpdate = selection.value as {
        value: EnhancedEscrowData;
        userId: string;
        timestamp: number;
      };

      // Only apply changes from other party
      if (escrowUpdate.userId !== currentUserId) {
        setEscrowData(escrowUpdate.value);
        // Also notify parent
        setTimeout(() => {
          onEscrowDataChange(escrowUpdate.value);
        }, 0);
      }
    }
  }, [
    conflictResolution,
    conflictResolution?.sharedSelections,
    currentUserId,
    currentStep,
    onEscrowDataChange,
  ]);

  const handleDataChange = (updates: Partial<EnhancedEscrowData>) => {
    const newData = { ...escrowData, ...updates };

    if (updates.deliverables) {
      newData.arbiter_required = shouldRequireArbiter(updates.deliverables);
    }

    setEscrowData(newData);

    // Call parent's onChange
    setTimeout(() => {
      onEscrowDataChange(newData);
    }, 0);

    // Sync to PartyKit if in collaborative mode (Step 5)
    if (conflictResolution && currentUserId && currentStep === 5) {
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce sync (500ms delay)
      debounceTimerRef.current = setTimeout(() => {
        conflictResolution.selectField(
          'escrowData' as keyof typeof conflictResolution.sharedSelections,
          {
            value: newData,
            userId: currentUserId,
            timestamp: Date.now(),
          }
        );
        debounceTimerRef.current = undefined;
      }, 500);
    }
  };

  const addDeliverable = async (
    party: PartyResponsible,
    type: EscrowType = 'service'
  ) => {
    // Use intelligent type inference if itemDetails is available
    let inferredType = type;
    if (itemDetails && party === 'initiator') {
      try {
        inferredType = await inferDeliverableType(itemDetails);
      } catch (error) {
        console.error('Error inferring type:', error);
        // Keep the default type if AI inference fails
      }
    }

    const newDeliverable: Deliverable = {
      id: `deliverable-${Date.now()}`,
      escrow_id: '', // Will be set when creating escrow
      type: inferredType,
      description: itemDetails?.name || '',
      party_responsible: party,
      value:
        party === 'participant' && itemDetails ? itemDetails.price : undefined,
      currency: party === 'participant' && itemDetails ? 'PHP' : undefined,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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

  const initiatorDeliverables = escrowData.deliverables.filter(
    (d) => d.party_responsible === 'initiator'
  );
  const participantDeliverables = escrowData.deliverables.filter(
    (d) => d.party_responsible === 'participant'
  );

  return (
    <div className="space-y-4">
      {enabled && (
        <div className="space-y-6">
          {/* Deliverables Section */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-base">Deliverables</span>
                </div>
                <Badge variant="outline" className="w-fit text-sm">
                  {escrowData.deliverables.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Initiator Deliverables */}
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 shrink-0 rounded-full bg-blue-500"></div>
                    <h4 className="text-sm font-medium text-blue-700">
                      {initiatorName
                        ? `${initiatorName}'s Obligations`
                        : "Initiator's Obligations"}
                    </h4>
                    <Badge variant="outline" className="text-sm">
                      {initiatorDeliverables.length}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDeliverable('initiator')}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>

                {initiatorDeliverables.length === 0 ? (
                  <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-6 text-center">
                    <Package className="text-muted-foreground mx-auto h-8 w-8" />
                    <p className="text-muted-foreground mt-2 text-sm">
                      No deliverables added yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {initiatorDeliverables.map((deliverable, index) => {
                      const typeInfo = DELIVERABLE_TYPES.find(
                        (t) => t.value === deliverable.type
                      );
                      return (
                        <Card
                          key={deliverable.id}
                          className="border-l-4 border-l-blue-200"
                        >
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-medium">
                                    Deliverable {index + 1}
                                  </span>
                                  {typeInfo && (
                                    <Badge
                                      className={`${typeInfo.color} px-2.5 py-1 text-xs font-normal`}
                                    >
                                      {React.createElement(typeInfo.icon, {
                                        className: 'mr-0.5 h-3 w-3',
                                      })}
                                      {typeInfo.label}
                                    </Badge>
                                  )}
                                  {typeInfo?.requiresArbiter && (
                                    <Badge
                                      variant="secondary"
                                      className="border-amber-200 px-2.5 py-1 text-xs font-normal text-amber-800"
                                    >
                                      <AlertTriangle className="mr-1 h-3 w-3" />
                                      Arbiter
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeDeliverable(deliverable.id)
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`type-${deliverable.id}`}
                                  className="text-xs"
                                >
                                  Deliverable Type *
                                </Label>
                                <Select
                                  value={deliverable.type}
                                  onValueChange={(value) =>
                                    updateDeliverable(deliverable.id, {
                                      type: value as EscrowType,
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DELIVERABLE_TYPES.map((type) => (
                                      <SelectItem
                                        key={type.value}
                                        value={type.value}
                                      >
                                        <div className="flex items-center gap-2">
                                          {React.createElement(type.icon, {
                                            className: 'h-4 w-4',
                                          })}
                                          <span>{type.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`description-${deliverable.id}`}
                                  className="text-xs"
                                >
                                  Description *
                                </Label>
                                <Textarea
                                  id={`description-${deliverable.id}`}
                                  value={deliverable.description}
                                  onChange={(e) =>
                                    updateDeliverable(deliverable.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Describe what needs to be delivered..."
                                  rows={2}
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            {(deliverable.type === 'cash' ||
                              deliverable.type === 'digital_transfer') && (
                              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`value-${deliverable.id}`}
                                    className="text-xs sm:text-sm"
                                  >
                                    Amount *
                                  </Label>
                                  <Input
                                    id={`value-${deliverable.id}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={deliverable.value || ''}
                                    onChange={(e) =>
                                      updateDeliverable(deliverable.id, {
                                        value: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    placeholder="0.00"
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`currency-${deliverable.id}`}
                                    className="text-xs sm:text-sm"
                                  >
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
                                    <SelectTrigger className="h-8">
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
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Participant Deliverables */}
              <div className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 shrink-0 rounded-full bg-green-500"></div>
                    <h4 className="text-sm font-medium text-green-700">
                      {participantName
                        ? `${participantName}'s Obligations`
                        : "Participant's Obligations"}
                    </h4>
                    <Badge variant="outline" className="text-sm">
                      {participantDeliverables.length}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDeliverable('participant')}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </div>

                {participantDeliverables.length === 0 ? (
                  <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-6 text-center">
                    <Package className="text-muted-foreground mx-auto h-8 w-8" />
                    <p className="text-muted-foreground mt-2 text-sm">
                      No deliverables added yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participantDeliverables.map((deliverable, index) => {
                      const typeInfo = DELIVERABLE_TYPES.find(
                        (t) => t.value === deliverable.type
                      );
                      return (
                        <Card
                          key={deliverable.id}
                          className="border-l-4 border-l-green-200"
                        >
                          <CardContent>
                            <div className="space-y-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-medium">
                                    Deliverable {index + 1}
                                  </span>
                                  {typeInfo && (
                                    <Badge
                                      className={`${typeInfo.color} px-2.5 py-1 text-xs`}
                                    >
                                      {React.createElement(typeInfo.icon, {
                                        className: 'mr-1 h-3 w-3',
                                      })}
                                      {typeInfo.label}
                                    </Badge>
                                  )}
                                  {typeInfo?.requiresArbiter && (
                                    <Badge
                                      variant="secondary"
                                      className="border-amber-200 px-2.5 py-1 text-xs text-amber-800"
                                    >
                                      <AlertTriangle className="mr-1 h-3 w-3" />
                                      Arbiter
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeDeliverable(deliverable.id)
                                  }
                                  className="w-full sm:w-auto"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`type-${deliverable.id}`}
                                  className="text-xs"
                                >
                                  Deliverable Type *
                                </Label>
                                <Select
                                  value={deliverable.type}
                                  onValueChange={(value) =>
                                    updateDeliverable(deliverable.id, {
                                      type: value as EscrowType,
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DELIVERABLE_TYPES.map((type) => (
                                      <SelectItem
                                        key={type.value}
                                        value={type.value}
                                      >
                                        <div className="flex items-center gap-2">
                                          {React.createElement(type.icon, {
                                            className: 'h-4 w-4',
                                          })}
                                          <span>{type.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label
                                  htmlFor={`description-${deliverable.id}`}
                                  className="text-xs"
                                >
                                  Description *
                                </Label>
                                <Textarea
                                  id={`description-${deliverable.id}`}
                                  value={deliverable.description}
                                  onChange={(e) =>
                                    updateDeliverable(deliverable.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder="Describe what needs to be delivered..."
                                  rows={2}
                                  className="text-sm"
                                />
                              </div>
                            </div>

                            {(deliverable.type === 'cash' ||
                              deliverable.type === 'digital_transfer') && (
                              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`value-${deliverable.id}`}
                                    className="text-xs sm:text-sm"
                                  >
                                    Amount *
                                  </Label>
                                  <Input
                                    id={`value-${deliverable.id}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={deliverable.value || ''}
                                    onChange={(e) =>
                                      updateDeliverable(deliverable.id, {
                                        value: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    placeholder="0.00"
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`currency-${deliverable.id}`}
                                    className="text-xs sm:text-sm"
                                  >
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
                                    <SelectTrigger className="h-8">
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
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary & Settings */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Escrow Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-5 w-5" />
                  Escrow Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Total Deliverables
                  </span>
                  <Badge variant="outline" className="text-sm">
                    {escrowData.deliverables.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Arbiter</span>
                  <div className="flex items-center gap-1">
                    <Shield
                      className={`h-4 w-4 ${escrowData.arbiter_required ? 'text-amber-600' : 'text-green-600'}`}
                    />
                    {escrowData.arbiter_required && (
                      <span className="text-xs font-medium text-amber-600">
                        Required
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completion Date */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5" />
                  Deadline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="completion-date" className="text-sm">
                    Completion{' '}
                    <span className="text-muted-foreground">(Optional)</span>
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
                    className="h-10 text-sm [&::-webkit-calendar-picker-indicator]:hue-rotate-[86deg] [&::-webkit-calendar-picker-indicator]:invert-[.6] [&::-webkit-calendar-picker-indicator]:saturate-[500%] [&::-webkit-calendar-picker-indicator]:sepia-[.9] [&::-webkit-calendar-picker-indicator]:filter"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
