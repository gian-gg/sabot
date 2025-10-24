'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Plus,
  X,
  Sparkles,
  Package,
  Wrench,
  FileText,
  CreditCard,
  Smartphone,
  Monitor,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
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
  initiatorName?: string;
  participantName?: string;
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
      'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
  },
  {
    value: 'item',
    label: 'Physical Item',
    icon: Package,
    description: 'Goods, products, merchandise',
    requiresArbiter: true,
    color:
      'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
  },
  {
    value: 'digital',
    label: 'Digital Asset',
    icon: Monitor,
    description: 'Files, software, digital content',
    requiresArbiter: false,
    color:
      'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-200',
  },
  {
    value: 'document',
    label: 'Document',
    icon: FileText,
    description: 'Papers, certificates, contracts',
    requiresArbiter: true,
    color:
      'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200',
  },
  {
    value: 'cash',
    label: 'Cash Payment',
    icon: CreditCard,
    description: 'Physical cash transactions',
    requiresArbiter: true,
    color:
      'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
  },
  {
    value: 'digital_transfer',
    label: 'Digital Transfer',
    icon: Smartphone,
    description: 'Online payments, transfers',
    requiresArbiter: false,
    color:
      'bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950 dark:border-cyan-800 dark:text-cyan-200',
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

function isDigitalAsset(itemDetails: ItemDetails): boolean {
  const digitalKeywords = [
    'digital',
    'online',
    'virtual',
    'electronic',
    'software',
    'app',
    'game',
    'ebook',
    'pdf',
    'download',
    'streaming',
    'subscription',
    'license',
    'art',
    'artwork',
    'portrait',
    'illustration',
    'design',
    'graphic',
    'image',
    'photo',
    'picture',
  ];

  const text =
    `${itemDetails.name} ${itemDetails.description} ${itemDetails.category}`.toLowerCase();
  return digitalKeywords.some((keyword) => text.includes(keyword));
}

function parseDeliverablesFromItemDetails(
  itemDetails: ItemDetails
): Deliverable[] {
  const deliverables: Deliverable[] = [];

  const itemType = isDigitalAsset(itemDetails) ? 'digital' : 'item';
  deliverables.push({
    id: `item-${Date.now()}`,
    type: itemType,
    description: itemDetails.name,
    party_responsible: 'initiator',
    value: itemDetails.price,
    currency: 'PHP',
  });

  deliverables.push({
    id: `payment-${Date.now() + 1}`,
    type: 'digital_transfer',
    description: `Payment of ₱${itemDetails.price}`,
    party_responsible: 'participant',
    value: itemDetails.price,
    currency: 'PHP',
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
      type: 'digital_transfer',
      description: `Payment of ₱${amount}`,
      party_responsible: 'participant',
      value: amount,
      currency: 'PHP',
    });
  }

  deliverables.push({
    id: `deliverable-${Date.now()}`,
    type: 'service',
    description: agreementTitle || 'Service as specified in agreement',
    party_responsible: 'initiator',
  });

  return deliverables;
}

export function EscrowProtectionEnhanced({
  enabled,
  onEnabledChange,
  onEscrowDataChange,
  agreementTitle,
  agreementTerms,
  itemDetails,
  initiatorId: _initiatorId,
  participantId: _participantId,
  initiatorName,
  participantName,
}: EscrowProtectionEnhancedProps) {
  const inferredDeliverables = useMemo(() => {
    if (itemDetails && itemDetails.name && itemDetails.price > 0) {
      return parseDeliverablesFromItemDetails(itemDetails);
    }
    if (agreementTerms) {
      return parseDeliverablesFromAgreement(agreementTerms, agreementTitle);
    }
    return [];
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

    if (updates.deliverables) {
      newData.arbiter_required = shouldRequireArbiter(updates.deliverables);
    }

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
  const initiatorDeliverables = escrowData.deliverables.filter(
    (d) => d.party_responsible === 'initiator'
  );
  const participantDeliverables = escrowData.deliverables.filter(
    (d) => d.party_responsible === 'participant'
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-950">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base">Escrow Protection</CardTitle>
              <p className="text-muted-foreground text-sm">
                Secure holding until deliverables are completed
              </p>
            </div>
          </div>
          <div className="flex justify-end sm:justify-start">
            <Switch
              checked={enabled}
              onCheckedChange={onEnabledChange}
              aria-label="Enable escrow protection"
            />
          </div>
        </div>
      </CardHeader>

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
                    <div className="h-3 w-3 flex-shrink-0 rounded-full bg-blue-500"></div>
                    <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">
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
                          className="border-l-4 border-l-blue-200 dark:border-l-blue-800"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-medium">
                                    Deliverable {index + 1}
                                  </span>
                                  {typeInfo && (
                                    <Badge
                                      className={`${typeInfo.color} text-sm`}
                                    >
                                      <typeInfo.icon className="mr-1 h-3 w-3" />
                                      {typeInfo.label}
                                    </Badge>
                                  )}
                                  {typeInfo?.requiresArbiter && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-amber-100 text-sm text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                    >
                                      Arbiter Required
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
                    <div className="h-3 w-3 flex-shrink-0 rounded-full bg-green-500"></div>
                    <h4 className="text-sm font-medium text-green-700 dark:text-green-300">
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
                          className="border-l-4 border-l-green-200 dark:border-l-green-800"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-medium">
                                    Deliverable {index + 1}
                                  </span>
                                  {typeInfo && (
                                    <Badge
                                      className={`${typeInfo.color} text-sm`}
                                    >
                                      <typeInfo.icon className="mr-1 h-3 w-3" />
                                      {typeInfo.label}
                                    </Badge>
                                  )}
                                  {typeInfo?.requiresArbiter && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-amber-100 text-sm text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                    >
                                      Arbiter Required
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
              <CardHeader className="pb-4">
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
                  <span className="text-muted-foreground text-sm">
                    Arbiter Required
                  </span>
                  <div className="flex items-center gap-1">
                    <Shield
                      className={`h-4 w-4 ${escrowData.arbiter_required ? 'text-amber-600' : 'text-green-600'}`}
                    />
                    {escrowData.arbiter_required && (
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Required
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completion Date */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5" />
                  Expected Completion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="completion-date" className="text-sm">
                    Completion Date{' '}
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
                    className="h-10 text-sm"
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
