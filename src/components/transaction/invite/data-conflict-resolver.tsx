'use client';

import { useState, useEffect } from 'react';
import * as Y from 'yjs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useCollaboration } from '@/lib/collaboration/use-collaboration';
import type { AnalysisData } from '@/types/analysis';

interface AnalysisWithSource extends AnalysisData {
  source: string;
  screenshotId: string;
}

interface DataConflictResolverProps {
  analyses: AnalysisWithSource[];
  onResolve: (resolvedData: AnalysisData) => void;
  onCancel?: () => void;
  transactionId?: string; // For collaborative sync
}

type FieldKey = keyof AnalysisData;

// Comparison fields for collaborative resolution
const COMPARISON_FIELDS: FieldKey[] = [
  'productType',
  'productModel',
  'productCondition',
  'proposedPrice',
  'quantity',
  'transactionType',
  'meetingLocation',
  'meetingSchedule',
  'deliveryAddress',
  'deliveryMethod',
];

export default function DataConflictResolver({
  analyses,
  onResolve,
  onCancel,
  transactionId,
}: DataConflictResolverProps) {
  const [selectedValues, setSelectedValues] = useState<Partial<AnalysisData>>(
    {}
  );
  const [ymap, setYmap] = useState<Y.Map<unknown> | null>(null);
  const [agreementStatus, setAgreementStatus] = useState<
    Record<string, boolean>
  >({});

  // Initialize Y.js collaboration when there are 2 analyses (buyer + seller)
  const isCollaborative = analyses.length === 2;
  const { ydoc, isConnected } = useCollaboration({
    documentId: transactionId
      ? `transaction-${transactionId}`
      : 'conflict-resolver',
    enabled: isCollaborative,
  });

  // Initialize Y.js shared map for tracking agreements
  useEffect(() => {
    if (!ydoc || !isCollaborative) return;

    const collaborativeMap = ydoc.getMap('field-agreements');
    setYmap(collaborativeMap);

    const updateHandler = () => {
      const agreements: Record<string, boolean> = {};
      COMPARISON_FIELDS.forEach((field) => {
        const fieldMap = collaborativeMap.get(String(field)) as
          | Y.Map<unknown>
          | undefined;
        // Check if field Y.Map exists and has an agreedValue
        const isAgreed: boolean =
          fieldMap instanceof Y.Map &&
          fieldMap.get('agreedValue') !== undefined;
        agreements[String(field)] = isAgreed;
      });
      setAgreementStatus(agreements);
    };

    collaborativeMap.observe(updateHandler);
    return () => {
      collaborativeMap.unobserve(updateHandler);
    };
  }, [ydoc, isCollaborative]);

  if (analyses.length === 0) {
    return (
      <Alert>
        <AlertDescription>No analysis data available.</AlertDescription>
      </Alert>
    );
  }

  // If only one analysis, auto-resolve
  if (analyses.length === 1) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { source, screenshotId, ...data } = analyses[0];
    return (
      <div className="space-y-4">
        <Alert className="border-border">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Only one screenshot analyzed. No conflicts to resolve.
          </AlertDescription>
        </Alert>
        <Button onClick={() => onResolve(data)} className="w-full" size="lg">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Continue with Extracted Data
        </Button>
      </div>
    );
  }

  // Define all fields in the specified order
  const allFields: FieldKey[] = [
    'productType',
    'productModel',
    'productCondition',
    'quantity',
    'itemDescription',
    'proposedPrice',
    'transactionType',
    'meetingLocation',
    'meetingSchedule',
    'deliveryAddress',
    'deliveryMethod',
  ];

  // Determine transaction type to show relevant fields
  const transactionTypes = analyses
    .map((a) => a.transactionType)
    .filter((v) => v !== undefined && v !== null);
  const primaryTransactionType = transactionTypes[0] || 'meetup';

  // Filter fields based on transaction type
  const relevantFields = allFields.filter((field) => {
    // Always show these fields
    if (
      ![
        'meetingLocation',
        'meetingSchedule',
        'deliveryAddress',
        'deliveryMethod',
      ].includes(field)
    ) {
      return true;
    }

    // Show meeting fields for meetup transactions
    if (
      primaryTransactionType === 'meetup' &&
      (field === 'meetingLocation' || field === 'meetingSchedule')
    ) {
      return true;
    }

    // Show delivery fields for online transactions
    if (
      primaryTransactionType === 'online' &&
      (field === 'deliveryAddress' || field === 'deliveryMethod')
    ) {
      return true;
    }

    return false;
  });

  // Categorize fields into conflicts, no data, and resolved
  const fieldCategories = relevantFields.map((field) => {
    const values = analyses
      .map((a) => a[field])
      .filter((v) => v !== undefined && v !== null && v !== '');
    const uniqueValues = [...new Set(values.map((v) => JSON.stringify(v)))];

    return {
      field,
      hasConflict: uniqueValues.length > 1,
      hasNoData: values.length === 0,
      hasData: values.length > 0,
      values,
    };
  });

  const conflicts = fieldCategories.filter((fc) => fc.hasConflict);

  const allRiskFlags = [...new Set(analyses.flatMap((a) => a.riskFlags || []))];

  const handleFieldSelect = (
    field: FieldKey,
    value: NonNullable<AnalysisData[FieldKey]>
  ) => {
    setSelectedValues((prev) => ({ ...prev, [field]: value }));

    // Sync to Y.js if collaborative
    if (ymap && isCollaborative) {
      try {
        // Serialize the value to JSON string for Y.Map compatibility
        const serializedValue =
          typeof value === 'object' ? JSON.stringify(value) : String(value);

        // Get or create a Y.Map for this field
        let fieldMap = ymap.get(String(field)) as Y.Map<unknown> | undefined;
        if (!fieldMap || !(fieldMap instanceof Y.Map)) {
          fieldMap = new Y.Map();
          ymap.set(String(field), fieldMap);
        }

        // Store the agreed value and who agreed
        fieldMap.set('agreedValue', serializedValue);
        fieldMap.set('agreedBy', 'buyer');
        fieldMap.set('timestamp', Date.now());
      } catch (error) {
        console.error('Error syncing field to Y.js:', error);
      }
    }
  };

  const handleResolve = () => {
    // Start with the first analysis as a base (it has all required fields)
    const baseAnalysis = analyses[0];
    const resolved: AnalysisData = {
      user_id: baseAnalysis.user_id,
      platform: baseAnalysis.platform,
      transactionType: baseAnalysis.transactionType,
      productType: baseAnalysis.productType,
      productModel: baseAnalysis.productModel,
      productCondition: baseAnalysis.productCondition,
      screenshot_url: baseAnalysis.screenshot_url,
    };

    // Helper function to safely set field values
    const setField = (field: FieldKey, value: unknown) => {
      switch (field) {
        case 'platform':
          resolved.platform = value as AnalysisData['platform'];
          break;
        case 'transactionType':
          resolved.transactionType = value as AnalysisData['transactionType'];
          break;
        case 'itemDescription':
          resolved.itemDescription = value as string | undefined;
          break;
        case 'productType':
          resolved.productType = value as string;
          break;
        case 'productModel':
          resolved.productModel = value as string;
          break;
        case 'productCondition':
          resolved.productCondition = value as string;
          break;
        case 'proposedPrice':
          resolved.proposedPrice = value as number | undefined;
          break;
        case 'currency':
          resolved.currency = value as string | undefined;
          break;
        case 'quantity':
          resolved.quantity = value as number | undefined;
          break;
        case 'meetingLocation':
          resolved.meetingLocation = value as string | undefined;
          break;
        case 'meetingSchedule':
          resolved.meetingSchedule = value as string | undefined;
          break;
        case 'deliveryAddress':
          resolved.deliveryAddress = value as string | undefined;
          break;
        case 'deliveryMethod':
          resolved.deliveryMethod = value as string | undefined;
          break;
        case 'riskFlags':
          resolved.riskFlags = value as string[] | undefined;
          break;
        case 'confidence':
          resolved.confidence = value as number | undefined;
          break;
        case 'extractedText':
          resolved.extractedText = value as string | undefined;
          break;
      }
    };

    // Merge data: use selected values, fall back to first non-empty value
    allFields.forEach((field) => {
      if (selectedValues[field] !== undefined) {
        setField(field, selectedValues[field]);
      } else {
        // Use first non-empty value
        for (const analysis of analyses) {
          const value = analysis[field];
          if (value !== undefined && value !== null && value !== '') {
            setField(field, value);
            break;
          }
        }
      }
    });

    // Merge risk flags from all analyses
    resolved.riskFlags = allRiskFlags;

    // Calculate average confidence
    const confidences = analyses
      .map((a) => a.confidence)
      .filter((c): c is number => c !== undefined);
    if (confidences.length > 0) {
      resolved.confidence =
        confidences.reduce((a, b) => a + b, 0) / confidences.length;
    }

    onResolve(resolved);
  };

  const canResolve = conflicts.every(
    (fc) => selectedValues[fc.field] !== undefined
  );

  const getFieldLabel = (field: FieldKey): string => {
    const labels: Partial<Record<FieldKey, string>> = {
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
      user_id: 'User ID',
      screenshot_url: 'Screenshot URL',
      extractedText: 'Extracted Text',
    };
    return labels[field] || String(field);
  };

  const formatValue = (
    value: string | number | string[] | undefined
  ): string => {
    if (value === undefined || value === null) return 'N/A';
    if (typeof value === 'number') return value.toFixed(2);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  // Calculate agreement progress for collaborative mode
  const agreedFields = isCollaborative
    ? conflicts.filter((fc) => agreementStatus[String(fc.field)])
    : [];
  const agreementPercentage = isCollaborative
    ? Math.round((agreedFields.length / conflicts.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Collaborative Header (when 2 analyses) */}
      {isCollaborative && (
        <Card className="border-blue-500/30 bg-blue-500/10 p-4">
          <div className="space-y-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}
              />
              <span className="text-sm font-medium">
                {isConnected ? 'Real-time sync active' : 'Connecting...'}
              </span>
            </div>

            {/* Agreement Progress */}
            {conflicts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Field Agreement</span>
                  <span className="text-sm font-medium">
                    {agreedFields.length} of {conflicts.length} (
                    {agreementPercentage}%)
                  </span>
                </div>
                <Progress value={agreementPercentage} className="h-2" />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Header */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {conflicts.length > 0 ? (
            <>
              Found {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}{' '}
              between the two screenshots. Please select the correct value for
              each field.
            </>
          ) : (
            <>
              Both screenshots analyzed successfully. Review the merged data
              below.
            </>
          )}
        </AlertDescription>
      </Alert>

      {/* Combined Risk Flags */}
      {allRiskFlags.length > 0 && (
        <Card className="border-border p-4">
          <h3 className="mb-2 text-sm font-semibold">⚠️ Combined Risk Flags</h3>
          <div className="flex flex-wrap gap-2">
            {allRiskFlags.map((flag, idx) => (
              <Badge key={idx} variant="destructive" className="text-xs">
                {flag}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* All Fields - Ordered Display */}
      <div className="space-y-4">
        {fieldCategories.map(({ field, hasConflict, hasNoData }) => {
          const values = analyses.map((a, idx) => ({
            value: a[field],
            source: `Screenshot ${idx + 1}`,
            confidence: a.confidence,
          }));

          const isAgreed = agreementStatus[String(field)];

          return (
            <Card
              key={field}
              className={`space-y-3 p-4 ${
                isCollaborative && isAgreed
                  ? 'border-green-500/30 bg-green-500/5'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  {getFieldLabel(field)}
                </Label>
                {hasConflict && (
                  <Badge
                    variant="outline"
                    className={
                      isCollaborative && isAgreed
                        ? 'border-green-500/50 text-green-600'
                        : 'border-yellow-500/50 text-yellow-600'
                    }
                  >
                    {isCollaborative && isAgreed ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Agreed
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Conflict
                      </>
                    )}
                  </Badge>
                )}
                {hasNoData && (
                  <Badge variant="outline">
                    <XCircle className="mr-1 h-3 w-3" />
                    No Data
                  </Badge>
                )}
                {!hasConflict && !hasNoData && (
                  <Badge variant="outline">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Matched
                  </Badge>
                )}
              </div>

              {hasNoData ? (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    No data was extracted for this field. You&apos;ll need to
                    fill this manually in the next step.
                  </AlertDescription>
                </Alert>
              ) : hasConflict ? (
                <RadioGroup
                  value={
                    selectedValues[field] !== undefined
                      ? String(selectedValues[field])
                      : undefined
                  }
                  onValueChange={(value) => {
                    // Try to parse back to original type
                    const originalValue = values.find(
                      (v) => String(v.value) === value
                    )?.value;
                    if (originalValue !== undefined) {
                      handleFieldSelect(field, originalValue);
                    }
                  }}
                  className="space-y-3"
                >
                  {values.map((item, idx) => {
                    if (
                      item.value === undefined ||
                      item.value === null ||
                      item.value === ''
                    )
                      return null;

                    const stringValue = String(item.value);
                    const isSelected = selectedValues[field] === item.value;

                    return (
                      <div
                        key={idx}
                        className={`flex items-start space-x-3 rounded-lg border p-3 transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem
                          value={stringValue}
                          id={`${field}-${idx}`}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={`${field}-${idx}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">
                                {formatValue(item.value)}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                From {item.source} •{' '}
                                {((item.confidence || 0) * 100).toFixed(0)}%
                                confidence
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="text-primary h-5 w-5" />
                            )}
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              ) : (
                <div className="border-border bg-secondary/50 rounded-lg border p-3">
                  <p className="font-medium">
                    {formatValue(values.find((v) => v.value)?.value)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Matched across all screenshots
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          onClick={handleResolve}
          disabled={conflicts.length > 0 && !canResolve}
          className="flex-1"
          size="lg"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          {conflicts.length > 0 ? 'Resolve & Continue' : 'Continue'}
        </Button>
      </div>

      {conflicts.length > 0 && !canResolve && (
        <p className="text-muted-foreground text-center text-sm">
          Please select a value for all conflicting fields to continue
        </p>
      )}
    </div>
  );
}
