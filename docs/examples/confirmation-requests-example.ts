/**
 * Example: Using Field Change Approval for Critical Changes
 *
 * This file demonstrates how to implement field change approval
 * for critical field changes in the transaction flow using the
 * FieldChangeApproval component and PartyKit sync.
 */

import { useSharedConflictResolution } from '@/hooks/use-shared-conflict-resolution';
import type { AnalysisData } from '@/types/analysis';

// Example 1: Broadcast field change with approval required
export function usePriceChangeWithConfirmation(
  conflictResolution:
    | ReturnType<typeof useSharedConflictResolution>
    | undefined,
  currentUserId: string,
  currentStep: number
) {
  const handlePriceChange = (
    newPrice: string,
    requireConfirmation: boolean = true
  ) => {
    if (!conflictResolution) return;

    if (requireConfirmation && conflictResolution.participants.length > 1) {
      // Broadcast field change - FieldChangeApproval will handle confirmation
      const messageId = `change-proposedPrice-${Date.now()}`;
      conflictResolution.selectField('proposedPrice' as keyof AnalysisData, {
        field: 'proposedPrice',
        value: newPrice,
        userId: currentUserId,
        timestamp: Date.now(),
        messageId,
      });

      // The change will be applied only after other party approves
      // via FieldChangeApproval component
    } else {
      // Apply change immediately (solo user or confirmation disabled)
      conflictResolution.selectField('proposedPrice' as keyof AnalysisData, {
        field: 'proposedPrice',
        value: newPrice,
        userId: currentUserId,
        timestamp: Date.now(),
      });
    }
  };

  return { handlePriceChange };
}

// Example 2: Batch changes for multiple fields
export function useBatchFieldConfirmation(
  conflictResolution:
    | ReturnType<typeof useSharedConflictResolution>
    | undefined,
  currentUserId: string,
  currentStep: number
) {
  const requestBatchConfirmation = (
    changes: Array<{
      field: keyof AnalysisData;
      value: unknown;
    }>
  ) => {
    if (!conflictResolution) return;

    // Send separate change for each field
    changes.forEach(({ field, value }) => {
      const messageId = `change-${String(field)}-${Date.now()}`;
      conflictResolution.selectField(field, {
        field,
        value,
        userId: currentUserId,
        timestamp: Date.now(),
        messageId,
      });
    });
  };

  return { requestBatchConfirmation };
}

// Example 3: Conditional confirmation based on change magnitude
export function useSmartPriceConfirmation(
  conflictResolution:
    | ReturnType<typeof useSharedConflictResolution>
    | undefined,
  currentUserId: string,
  currentStep: number,
  currentPrice: number
) {
  const handlePriceChange = (newPrice: number) => {
    if (!conflictResolution) return;

    // Calculate percentage change
    const percentageChange =
      Math.abs((newPrice - currentPrice) / currentPrice) * 100;

    // Require confirmation if price changes by more than 10%
    const requiresConfirmation = percentageChange > 10;

    const messageId = requiresConfirmation
      ? `change-proposedPrice-${Date.now()}`
      : undefined;

    conflictResolution.selectField('proposedPrice' as keyof AnalysisData, {
      field: 'proposedPrice',
      value: newPrice,
      userId: currentUserId,
      timestamp: Date.now(),
      messageId, // Include messageId only if confirmation required
    });
  };

  return { handlePriceChange };
}

// Example 4: Listen for approval/rejection responses
export function useConfirmationResponseHandler() {
  // This is handled by FieldChangeApproval component
  // which dispatches 'transaction-confirmation-required' events

  const handleApproval = (field: string, value: unknown) => {
    console.log(`✅ Change approved for ${field}:`, value);
    // Apply the change via handleApproveChange callback
  };

  const handleRejection = (field: string) => {
    console.log(`❌ Change rejected for ${field}`);
    // Keep current value via handleRejectChange callback
  };

  return { handleApproval, handleRejection };
}

// Example 5: Integration in CreateTransactionForm
export function exampleIntegration() {
  /*
  // In CreateTransactionForm component:
  
  const updateFormData = (field: keyof TransactionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Broadcast with debounce (already implemented)
    if (conflictResolution && currentUserId && currentStep >= 3) {
      const existingTimer = debounceTimersRef.current.get(field);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        const messageId = `change-formField_${field}-${Date.now()}`;
        conflictResolution.selectField(
          `formField_${field}` as keyof AnalysisData,
          {
            field,
            value,
            userId: currentUserId,
            timestamp: Date.now(),
            messageId, // Triggers FieldChangeApproval dialog
          }
        );
        debounceTimersRef.current.delete(field);
      }, 500);

      debounceTimersRef.current.set(field, timer);
    }
  };
  
  // FieldChangeApproval component handles approval dialogs
  <FieldChangeApproval
    onRespond={handleChangeResponse}
    onApprove={handleApproveChange}
    onReject={handleRejectChange}
  />
  */
}

// Example 6: Critical fields that require approval
const CRITICAL_FIELDS: Array<keyof AnalysisData> = [
  'proposedPrice',
  'meetingLocation',
  'deliveryAddress',
];

export function isCriticalField(field: keyof AnalysisData): boolean {
  return CRITICAL_FIELDS.includes(field);
}

export function useFieldChangeHandler(
  conflictResolution:
    | ReturnType<typeof useSharedConflictResolution>
    | undefined,
  currentUserId: string,
  currentStep: number
) {
  const handleFieldChange = (field: keyof AnalysisData, value: unknown) => {
    if (!conflictResolution) return;

    // All fields in Step 3+ trigger approval via messageId
    const messageId = `change-${String(field)}-${Date.now()}`;

    conflictResolution.selectField(field, {
      field,
      value,
      userId: currentUserId,
      timestamp: Date.now(),
      messageId, // Triggers FieldChangeApproval component
    });
  };

  return { handleFieldChange };
}
