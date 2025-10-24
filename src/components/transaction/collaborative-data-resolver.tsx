'use client';

import { useState, useEffect } from 'react';
import * as Y from 'yjs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Clock, Radio } from 'lucide-react';
import { useCollaboration } from '@/lib/collaboration/use-collaboration';
import type { AnalysisData } from '@/types/analysis';

export interface AnalysisWithSource extends AnalysisData {
  source: 'buyer' | 'seller';
}

interface CollaborativeDataResolverProps {
  buyerAnalysis: AnalysisData;
  sellerAnalysis: AnalysisData;
  transactionId: string;
  onResolve: (resolvedData: AnalysisData) => void;
  onCancel?: () => void;
}

type FieldKey = keyof AnalysisData;

interface FieldAgreement {
  fieldId: FieldKey;
  buyerValue: unknown;
  sellerValue: unknown;
  agreedValue?: unknown;
  agreedBy?: 'buyer' | 'seller' | 'both';
  status: 'agreed' | 'negotiating' | 'conflict';
}

interface StoredFieldData {
  buyerValue?: unknown;
  sellerValue?: unknown;
  agreedValue?: unknown;
  agreedBy?: 'buyer' | 'seller' | 'both';
}

// All fields to compare
const COMPARISON_FIELDS: FieldKey[] = [
  'productType',
  'productModel',
  'productCondition',
  'proposedPrice',
  'currency',
  'quantity',
  'transactionType',
  'meetingLocation',
  'meetingSchedule',
  'deliveryAddress',
  'deliveryMethod',
];

export function CollaborativeDataResolver({
  buyerAnalysis,
  sellerAnalysis,
  transactionId,
  onResolve,
  onCancel,
}: CollaborativeDataResolverProps) {
  const { ydoc, awareness, isConnected } = useCollaboration({
    documentId: `transaction-${transactionId}`,
    enabled: true,
  });

  const [fieldAgreements, setFieldAgreements] = useState<FieldAgreement[]>([]);
  const [selectedValues, setSelectedValues] = useState<Partial<AnalysisData>>(
    {}
  );
  const [ymap, setYmap] = useState<Y.Map<unknown> | null>(null);

  // Initialize field agreements
  useEffect(() => {
    const agreements: FieldAgreement[] = COMPARISON_FIELDS.map((fieldId) => {
      const buyerValue = buyerAnalysis[fieldId];
      const sellerValue = sellerAnalysis[fieldId];
      const isAgreed = buyerValue === sellerValue;

      return {
        fieldId,
        buyerValue,
        sellerValue,
        agreedValue: isAgreed ? buyerValue : undefined,
        status: isAgreed ? 'agreed' : 'negotiating',
      };
    });

    setFieldAgreements(agreements);
  }, [buyerAnalysis, sellerAnalysis]);

  // Initialize Y.js shared state
  useEffect(() => {
    if (!ydoc) return;

    const collaborativeMap = ydoc.getMap('field-agreements');
    setYmap(collaborativeMap);

    // Listen for changes from other party
    const updateHandler = () => {
      const agreements: FieldAgreement[] = COMPARISON_FIELDS.map((fieldId) => {
        const stored = collaborativeMap.get(String(fieldId)) as
          | StoredFieldData
          | undefined;

        const buyerValue = buyerAnalysis[fieldId];
        const sellerValue = sellerAnalysis[fieldId];
        const isAgreed =
          buyerValue === sellerValue || stored?.agreedValue !== undefined;

        return {
          fieldId,
          buyerValue,
          sellerValue,
          agreedValue:
            stored?.agreedValue || (isAgreed ? buyerValue : undefined),
          agreedBy: stored?.agreedBy,
          status: isAgreed ? 'agreed' : 'negotiating',
        };
      });

      setFieldAgreements(agreements);
    };

    collaborativeMap.observe(updateHandler);
    return () => {
      collaborativeMap.unobserve(updateHandler);
    };
  }, [ydoc, buyerAnalysis, sellerAnalysis]);

  // Get buyer/seller info from awareness
  const getParticipantInfo = () => {
    if (!awareness) {
      return {
        buyerName: 'Buyer',
        sellerName: 'Seller',
        buyerOnline: false,
        sellerOnline: false,
      };
    }

    // In production, would track buyer/seller presence separately
    const buyerOnline = isConnected;
    const sellerOnline = isConnected;

    return {
      buyerName: 'Buyer',
      sellerName: 'Seller',
      buyerOnline,
      sellerOnline,
    };
  };

  const handleFieldSelect = (
    fieldId: FieldKey,
    value: unknown,
    selectedBy: 'buyer' | 'seller'
  ) => {
    setSelectedValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Sync to Y.js
    if (ymap) {
      const stored = (ymap.get(String(fieldId)) || {}) as StoredFieldData;
      const updated: StoredFieldData = {
        ...stored,
        agreedValue: value,
        agreedBy: selectedBy,
      };
      ymap.set(String(fieldId), updated);
    }
  };

  const agreedCount = fieldAgreements.filter(
    (f) => f.status === 'agreed'
  ).length;
  const totalFields = fieldAgreements.length;
  const agreementPercentage = Math.round((agreedCount / totalFields) * 100);
  const canResolve = agreedCount === totalFields;

  const { buyerName, sellerName, buyerOnline, sellerOnline } =
    getParticipantInfo();

  const handleResolve = () => {
    // Merge agreed values
    const resolved: AnalysisData = {
      ...buyerAnalysis,
    };

    fieldAgreements.forEach((agreement) => {
      if (agreement.agreedValue !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (resolved as any)[agreement.fieldId] = agreement.agreedValue;
      }
    });

    onResolve(resolved);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!isConnected && (
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <CardContent className="flex items-start gap-3 pt-6">
            <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-600">
                Connecting...
              </p>
              <p className="text-xs text-yellow-600/70">
                Real-time synchronization will start once connection is
                established
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Header */}
      <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Participants Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${buyerOnline ? 'bg-green-500' : 'bg-neutral-500'}`}
                />
                <span className="text-sm font-medium text-white">
                  {buyerName}
                </span>
              </div>
              <div
                className={`h-3 w-3 rounded-full ${sellerOnline ? 'bg-green-500' : 'bg-neutral-500'}`}
              />
              <span className="text-sm font-medium text-white">
                {sellerName}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-400">
                  Field Agreement Progress
                </p>
                <p className="text-sm font-semibold text-white">
                  {agreedCount} of {totalFields} fields ({agreementPercentage}%)
                </p>
              </div>
              <Progress value={agreementPercentage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fields Comparison */}
      <div className="space-y-3">
        {fieldAgreements.map((agreement) => {
          const { fieldId, buyerValue, sellerValue, status } = agreement;
          const isSame = buyerValue === sellerValue;

          return (
            <Card
              key={String(fieldId)}
              className={`border-neutral-800/60 ${
                status === 'agreed'
                  ? 'bg-green-900/10'
                  : status === 'conflict'
                    ? 'bg-red-900/10'
                    : 'bg-gradient-to-b from-neutral-900/40 to-neutral-950/60'
              }`}
            >
              <CardContent className="pt-4">
                {/* Field Header */}
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-white capitalize">
                    {getFieldLabel(fieldId)}
                  </p>
                  {status === 'agreed' ? (
                    <Badge className="flex items-center gap-1 bg-green-500/20 text-green-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Agreed
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 border-yellow-500/30 text-yellow-600"
                    >
                      <AlertCircle className="h-3 w-3" />
                      Negotiating
                    </Badge>
                  )}
                </div>

                {/* Values Comparison */}
                {isSame ? (
                  <div className="rounded-lg bg-black/40 p-3">
                    <p className="text-sm font-medium text-white">
                      {formatValue(buyerValue)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Both parties agree
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Buyer's Value */}
                    <button
                      onClick={() =>
                        handleFieldSelect(fieldId, buyerValue, 'buyer')
                      }
                      className={`rounded-lg border-2 p-3 text-left transition-colors ${
                        selectedValues[fieldId] === buyerValue
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-neutral-800/60 bg-black/40 hover:border-neutral-700'
                      }`}
                    >
                      <p className="mb-1 text-xs text-neutral-400">
                        {buyerName}&apos;s Value
                      </p>
                      <p className="text-sm font-medium text-white">
                        {formatValue(buyerValue)}
                      </p>
                    </button>

                    {/* Seller's Value */}
                    <button
                      onClick={() =>
                        handleFieldSelect(fieldId, sellerValue, 'seller')
                      }
                      className={`rounded-lg border-2 p-3 text-left transition-colors ${
                        selectedValues[fieldId] === sellerValue
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-neutral-800/60 bg-black/40 hover:border-neutral-700'
                      }`}
                    >
                      <p className="mb-1 text-xs text-neutral-400">
                        {sellerName}&apos;s Value
                      </p>
                      <p className="text-sm font-medium text-white">
                        {formatValue(sellerValue)}
                      </p>
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help Text */}
      {fieldAgreements.some((f) => f.status === 'negotiating') && (
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardContent className="flex items-start gap-3 pt-6">
            <Radio className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-600">How it works</p>
              <p className="text-xs text-blue-600/70">
                Click on a value to agree with it. Once both parties agree on
                all fields, you can proceed with the transaction.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          onClick={handleResolve}
          disabled={!canResolve}
          className={`flex-1 ${
            canResolve
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'opacity-50'
          }`}
          size="lg"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {canResolve
            ? 'All Fields Agreed - Continue'
            : `Resolve ${agreedCount}/${totalFields} Fields`}
        </Button>
      </div>

      {!canResolve && (
        <p className="text-center text-xs text-neutral-400">
          Both parties must agree on all {totalFields} fields to continue
        </p>
      )}
    </div>
  );
}

// Helper function to get field label
function getFieldLabel(field: FieldKey): string {
  const labels: Record<FieldKey, string> = {
    platform: 'Platform',
    transactionType: 'Transaction Type',
    itemDescription: 'Description',
    productType: 'Item Name',
    productModel: 'Product Model',
    productCondition: 'Condition',
    proposedPrice: 'Price',
    currency: 'Currency',
    quantity: 'Quantity',
    meetingLocation: 'Meeting Location',
    meetingSchedule: 'Scheduled Date & Time',
    deliveryAddress: 'Delivery Address',
    deliveryMethod: 'Delivery Method',
    riskFlags: 'Risk Flags',
    confidence: 'Confidence',
    user_id: 'User',
    screenshot_url: 'Screenshot',
    extractedText: 'Extracted Text',
    id: 'ID',
  };

  return labels[field] || String(field);
}

// Helper function to format values
function formatValue(value: unknown): string {
  if (value === undefined || value === null) return 'N/A';
  if (typeof value === 'number') return value.toFixed(2);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}
