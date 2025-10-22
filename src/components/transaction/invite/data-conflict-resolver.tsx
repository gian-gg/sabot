'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import type { AnalysisData } from '@/types/analysis';

interface AnalysisWithSource extends AnalysisData {
  source: string;
  screenshotId: string;
}

interface DataConflictResolverProps {
  analyses: AnalysisWithSource[];
  onResolve: (resolvedData: AnalysisData) => void;
  onCancel?: () => void;
}

type FieldKey = keyof AnalysisData;

export function DataConflictResolver({
  analyses,
  onResolve,
  onCancel,
}: DataConflictResolverProps) {
  const [selectedValues, setSelectedValues] = useState<Partial<AnalysisData>>(
    {}
  );

  if (analyses.length === 0) {
    return (
      <Alert>
        <AlertDescription>No analysis data available.</AlertDescription>
      </Alert>
    );
  }

  // If only one analysis, auto-resolve
  if (analyses.length === 1) {
    const { source, screenshotId, ...data } = analyses[0];
    return (
      <div className="space-y-4">
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
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

  // Find fields with conflicts
  const fields: FieldKey[] = [
    'platform',
    'transactionType',
    'itemDescription',
    'productType',
    'productModel',
    'productCondition',
    'proposedPrice',
    'currency',
    'meetingLocation',
    'meetingTime',
  ];

  const conflicts = fields.filter((field) => {
    const values = analyses
      .map((a) => a[field])
      .filter((v) => v !== undefined && v !== null && v !== '');
    const uniqueValues = [...new Set(values.map((v) => JSON.stringify(v)))];
    return uniqueValues.length > 1;
  });

  const allRiskFlags = [...new Set(analyses.flatMap((a) => a.riskFlags || []))];

  const handleFieldSelect = (
    field: FieldKey,
    value: NonNullable<AnalysisData[FieldKey]>
  ) => {
    setSelectedValues((prev) => ({ ...prev, [field]: value }));
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
        case 'meetingLocation':
          resolved.meetingLocation = value as string | undefined;
          break;
        case 'meetingTime':
          resolved.meetingTime = value as string | undefined;
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
    fields.forEach((field) => {
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
    (field) => selectedValues[field] !== undefined
  );

  const getFieldLabel = (field: FieldKey): string => {
    const labels: Partial<Record<FieldKey, string>> = {
      platform: 'Platform',
      transactionType: 'Transaction Type',
      itemDescription: 'Item Description',
      productType: 'Product Type',
      productModel: 'Product Model',
      productCondition: 'Product Condition',
      proposedPrice: 'Proposed Price',
      currency: 'Currency',
      meetingLocation: 'Meeting Location',
      meetingTime: 'Meeting Time',
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 dark:text-amber-200">
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
        <Card className="border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <h3 className="mb-2 text-sm font-semibold text-red-900 dark:text-red-100">
            ⚠️ Combined Risk Flags
          </h3>
          <div className="flex flex-wrap gap-2">
            {allRiskFlags.map((flag, idx) => (
              <Badge key={idx} variant="destructive" className="text-xs">
                {flag}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Confidence Scores */}
      <div className="grid grid-cols-2 gap-4">
        {analyses.map((analysis, idx) => (
          <Card key={idx} className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Screenshot {idx + 1}</span>
              <Badge variant="outline">
                {((analysis.confidence || 0) * 100).toFixed(0)}% confidence
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Conflict Fields */}
      {conflicts.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Users className="h-5 w-5" />
            Resolve Conflicts
          </h3>

          {conflicts.map((field) => {
            const values = analyses.map((a, idx) => ({
              value: a[field],
              source: `Screenshot ${idx + 1}`,
              confidence: a.confidence,
            }));

            return (
              <Card key={field} className="p-4">
                <Label className="mb-3 block text-base font-semibold">
                  {getFieldLabel(field)}
                </Label>
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
              </Card>
            );
          })}
        </div>
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
