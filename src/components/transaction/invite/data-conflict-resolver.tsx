'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getBestValue, hasConflict } from '@/lib/utils/conflict-resolution';
import type { AnalysisData } from '@/types/analysis';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSharedConflictResolution } from '@/hooks/use-shared-conflict-resolution';
import { toast } from 'sonner';
import { MutualConfirmation } from '@/components/transaction/invite/mutual-confirmation';

interface AnalysisWithSource extends AnalysisData {
  source: string;
  screenshotId: string;
}

interface DataConflictResolverProps {
  analyses: AnalysisWithSource[];
  onResolve: (resolvedData: AnalysisData) => void;
  transactionId: string;
  userId: string;
  userName: string;
  onAllReady?: (isReady: boolean) => void;
  conflictResolution?: ReturnType<typeof useSharedConflictResolution>;
}

type FieldKey = keyof AnalysisData;

export function DataConflictResolver({
  analyses,
  onResolve,
  transactionId,
  userId,
  userName,
  onAllReady,
  conflictResolution: externalConflictResolution,
}: DataConflictResolverProps) {
  const [selectedValues, setSelectedValues] = useState<Partial<AnalysisData>>(
    {}
  );
  const prevSelectionsRef = useRef<Partial<Record<keyof AnalysisData, number>>>(
    {}
  );
  const hasResolvedRef = useRef(false);

  // Use PartyKit for real-time collaboration - either from parent or create own
  const internalConflictResolution = useSharedConflictResolution(
    transactionId,
    userId,
    userName
  );
  const {
    sharedSelections,
    participants,
    isConnected,
    selectField,
    setUserReady,
    allParticipantsReady,
  } = externalConflictResolution || internalConflictResolution;

  // Sync shared selections to local state and show notifications
  useEffect(() => {
    console.log('[Resolver] Shared selections updated:', sharedSelections);

    const newSelections: Partial<AnalysisData> = {};

    Object.entries(sharedSelections).forEach(([field, selection]) => {
      if (selection) {
        const fieldKey = field as keyof AnalysisData;
        // Use Record type to handle dynamic field assignment
        (newSelections as Record<string, unknown>)[fieldKey] = selection.value;

        // Check if this is a selection by another user that we haven't seen before
        const prevSelection = prevSelectionsRef.current[fieldKey];
        const isNewSelection =
          !prevSelection || prevSelection !== selection.timestamp;
        const isOtherUser = selection.userId !== userId;

        console.log('[Resolver] Selection check:', {
          field: fieldKey,
          selectionUserId: selection.userId,
          currentUserId: userId,
          isOtherUser,
          isNewSelection,
          prevTimestamp: prevSelection,
          newTimestamp: selection.timestamp,
        });

        if (isOtherUser && isNewSelection) {
          const fieldLabel = getFieldLabel(fieldKey);
          console.log('[Resolver] 🎯 SHOWING TOAST for:', fieldLabel);
          toast.info(`Other party selected a value for ${fieldLabel}`, {
            duration: 3000,
          });
        }
      }
    });

    // Update previous selections with timestamps
    const newPrevSelections: Partial<Record<keyof AnalysisData, number>> = {};
    Object.entries(sharedSelections).forEach(([field, selection]) => {
      if (selection) {
        newPrevSelections[field as keyof AnalysisData] = selection.timestamp;
      }
    });
    prevSelectionsRef.current = newPrevSelections;

    setSelectedValues(newSelections);
  }, [sharedSelections, userId]);

  // Process all data BEFORE any conditional returns
  // Define all fields in the specified order - memoized to prevent recreating on every render
  const allFields: FieldKey[] = useMemo(
    () => [
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
    ],
    []
  );

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

    // Use smart conflict detection
    const hasFieldConflict = hasConflict(values);
    const bestValue = getBestValue(values);

    return {
      field,
      hasConflict: hasFieldConflict,
      hasNoData: values.length === 0,
      hasData: values.length > 0,
      values,
      bestValue, // The automatically selected best value
    };
  });

  const conflicts = fieldCategories.filter((fc) => fc.hasConflict);

  // Memoize allRiskFlags to prevent recreating on every render
  const allRiskFlags = useMemo(
    () => [...new Set(analyses.flatMap((a) => a.riskFlags || []))],
    [analyses]
  );

  const handleFieldSelect = (
    field: FieldKey,
    value: NonNullable<AnalysisData[FieldKey]>
  ) => {
    // Broadcast selection to other participants via PartyKit
    selectField(field, value);
  };

  // Check if we can resolve
  const canResolve = conflicts.every(
    (fc) => selectedValues[fc.field] !== undefined
  );

  // Check if all participants are ready to proceed
  const allReady = allParticipantsReady();

  // Check if current user has confirmed
  const currentUserReady =
    participants.find((p) => p.id === userId)?.isReady || false;

  // Wrap handleResolve in useCallback to stabilize the function
  const handleResolve = useCallback(() => {
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

    // Merge data: use selected values, fall back to best value, then first non-empty value
    allFields.forEach((field) => {
      if (selectedValues[field] !== undefined) {
        setField(field, selectedValues[field]);
      } else {
        // Try to get the best value from all analyses
        const fieldCategory = fieldCategories.find((fc) => fc.field === field);
        if (fieldCategory?.bestValue !== undefined) {
          setField(field, fieldCategory.bestValue);
        } else {
          // Use first non-empty value as fallback
          for (const analysis of analyses) {
            const value = analysis[field];
            if (value !== undefined && value !== null && value !== '') {
              setField(field, value);
              break;
            }
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
  }, [
    allFields,
    analyses,
    fieldCategories,
    onResolve,
    selectedValues,
    allRiskFlags,
  ]);

  // Memoize the handleAllReady callback with handleResolve in dependencies
  const handleAllReady = useCallback(
    (isReady: boolean) => {
      if (isReady && canResolve && !hasResolvedRef.current) {
        hasResolvedRef.current = true;
        handleResolve();
      }
      onAllReady?.(isReady);
    },
    [canResolve, handleResolve, onAllReady]
  );

  // Early returns AFTER all hooks
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {conflicts.length > 0 ? (
            <>
              Found {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}{' '}
              between the screenshots. Similar values have been automatically
              resolved. Please select the correct value for remaining conflicts.
            </>
          ) : (
            <>
              Screenshots analyzed successfully. Similar values were
              automatically resolved by selecting the most detailed options.
              Review the merged data below.
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
        {fieldCategories.map(({ field, hasConflict, hasNoData, bestValue }) => {
          const values = analyses.map((a, idx) => ({
            value: a[field],
            source: `Screenshot ${idx + 1}`,
            confidence: a.confidence,
          }));

          return (
            <Card key={field} className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">
                  {getFieldLabel(field)}
                </Label>
                {hasConflict && (
                  <Badge
                    variant="outline"
                    className="border-red-500/20 bg-red-500/10 text-red-600"
                  >
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Conflict
                  </Badge>
                )}
                {hasNoData && (
                  <Badge variant="outline">
                    <XCircle className="mr-1 h-3 w-3" />
                    No Data
                  </Badge>
                )}
                {!hasConflict && !hasNoData && (
                  <Badge
                    variant="outline"
                    className="bg-muted/50 text-muted-foreground border-muted"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Auto-resolved
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
                    // Prevent changes if current user has already confirmed
                    if (currentUserReady) {
                      toast.error('Cannot change selections after confirming');
                      return;
                    }

                    // Prevent changes once both parties are ready
                    if (allReady) {
                      toast.error(
                        'Cannot change selections - both parties already confirmed'
                      );
                      return;
                    }

                    // Try to parse back to original type
                    const originalValue = values.find(
                      (v) => String(v.value) === value
                    )?.value;
                    if (originalValue !== undefined) {
                      handleFieldSelect(field, originalValue);
                    }
                  }}
                  className="space-y-3"
                  disabled={currentUserReady || allReady}
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
                            : currentUserReady || allReady
                              ? 'border-muted bg-muted/20 cursor-not-allowed opacity-60'
                              : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem
                          value={stringValue}
                          id={`${field}-${idx}`}
                          className="mt-1"
                          disabled={currentUserReady || allReady}
                        />
                        <Label
                          htmlFor={`${field}-${idx}`}
                          className={`flex-1 ${currentUserReady || allReady ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
                <div className="bg-muted/30 border-muted rounded-lg border p-3">
                  <p className="font-medium">
                    {formatValue(
                      bestValue || values.find((v) => v.value)?.value
                    )}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {bestValue
                      ? 'Automatically selected the most detailed value'
                      : 'Matched across all screenshots'}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="pt-4">
        <MutualConfirmation
          userId={userId}
          participants={participants}
          isConnected={isConnected}
          canProceed={canResolve}
          onConfirm={setUserReady}
          onAllReady={handleAllReady}
          onRetryConnection={() => {
            // Simple retry: refresh the page to reconnect
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
        />
      </div>

      {conflicts.length > 0 && !canResolve && (
        <p className="text-muted-foreground pt-2 text-center text-sm">
          Please select a value for all conflicting fields to continue
        </p>
      )}

      {/* Show proceeding message when all participants are ready */}
      {allReady && canResolve && (
        <Alert className="border-primary bg-primary/10">
          <AlertDescription className="text-primary">
            Both parties confirmed. Click &ldquo;Next&rdquo; to proceed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
