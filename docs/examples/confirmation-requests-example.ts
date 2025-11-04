/**
 * Example: Using Confirmation Requests for Critical Changes
 *
 * This file demonstrates how to implement confirmation requests
 * for critical field changes in the transaction flow.
 */

import { useSharedConflictResolution } from '@/hooks/use-shared-conflict-resolution';
import type { AnalysisData } from '@/types/analysis';

// Example 1: Request confirmation before changing price
export function usePriceChangeWithConfirmation(
  conflictResolution:
    | ReturnType<typeof useSharedConflictResolution>
    | undefined,
  currentStep: number
) {
  const handlePriceChange = (
    newPrice: string,
    requireConfirmation: boolean = true
  ) => {
    if (!conflictResolution) return;

    if (requireConfirmation && conflictResolution.participants.length > 1) {
      // Request confirmation from other party
      conflictResolution.requestConfirmation(
        'proposedPrice',
        newPrice,
        currentStep
      );

      // The change will be applied only after confirmation
      // Listen for confirmation_response in the hook
    } else {
      // Apply change immediately (solo user or confirmation disabled)
      // ... update form data

      // Still notify the other party
      conflictResolution.notifyFieldChange(
        'proposedPrice',
        newPrice,
        currentStep
      );
    }
  };

  return { handlePriceChange };
}

// Example 2: Batch confirmation for multiple fields
export function useBatchFieldConfirmation(
  conflictResolution:
    | ReturnType<typeof useSharedConflictResolution>
    | undefined,
  currentStep: number
) {
  const requestBatchConfirmation = (
    changes: Array<{
      field: keyof AnalysisData;
      value: unknown;
    }>
  ) => {
    if (!conflictResolution) return;

    // Send separate confirmation request for each field
    changes.forEach(({ field, value }) => {
      conflictResolution.requestConfirmation(field, value, currentStep);
    });
  };

  return { requestBatchConfirmation };
}

// Example 3: Conditional confirmation based on change magnitude
export function useSmartPriceConfirmation(
  conflictResolution:
    | ReturnType<typeof useSharedConflictResolution>
    | undefined,
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

    if (requiresConfirmation) {
      conflictResolution.requestConfirmation(
        'proposedPrice',
        newPrice,
        currentStep
      );
    } else {
      // Small change - just notify
      conflictResolution.notifyFieldChange(
        'proposedPrice',
        newPrice,
        currentStep
      );
    }
  };

  return { handlePriceChange };
}

// Example 4: Listen for confirmation responses
export function useConfirmationResponseHandler() {
  // This would be integrated into the component that requested confirmation

  const handleConfirmationResponse = (
    confirmed: boolean,
    field: keyof AnalysisData,
    value: unknown
  ) => {
    if (confirmed) {
      console.log(`✅ Change confirmed for ${field}:`, value);
      // Apply the change
      // updateFormData(field, value);
    } else {
      console.log(`❌ Change rejected for ${field}`);
      // Revert to previous value or show error
      // toast.error('Change was not accepted by the other party');
    }
  };

  return { handleConfirmationResponse };
}

// Example 5: Integration in CreateTransactionForm
export function exampleIntegration() {
  /*
  // In CreateTransactionForm component:
  
  const updateFormDataWithConfirmation = (
    field: keyof TransactionFormData,
    value: string,
    requireConfirmation: boolean = false
  ) => {
    if (requireConfirmation && conflictResolution) {
      // Request confirmation first
      conflictResolution.requestConfirmation(
        field as keyof AnalysisData,
        value,
        currentStep
      );
      
      // Store pending change
      setPendingChanges((prev) => ({
        ...prev,
        [field]: value,
      }));
      
      // Show toast to user
      toast.info('Confirmation requested from other party');
      
      // The change will be applied when confirmation is received
      // via the confirmation_response handler in the hook
    } else {
      // Apply immediately
      setFormData((prev) => {
        // Notify if this is an actual change
        if (prev[field] && prev[field] !== value && conflictResolution) {
          conflictResolution.notifyFieldChange(
            field as keyof AnalysisData,
            value,
            currentStep
          );
        }
        
        return { ...prev, [field]: value };
      });
    }
  };
  
  // Listen for confirmation responses
  useEffect(() => {
    const handleConfirmationEvent = (event: CustomEvent) => {
      const { messageId, confirmed } = event.detail;
      
      // Find the pending change
      const change = pendingChanges[messageId];
      
      if (confirmed && change) {
        // Apply the confirmed change
        setFormData((prev) => ({
          ...prev,
          ...change,
        }));
        
        // Clear pending change
        setPendingChanges((prev) => {
          const newPending = { ...prev };
          delete newPending[messageId];
          return newPending;
        });
      }
    };
    
    window.addEventListener('transaction-confirmation-response', handleConfirmationEvent);
    
    return () => {
      window.removeEventListener('transaction-confirmation-response', handleConfirmationEvent);
    };
  }, [pendingChanges]);
  */
}

// Example 6: Confirmation for critical fields only
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
  currentStep: number
) {
  const handleFieldChange = (field: keyof AnalysisData, value: unknown) => {
    if (!conflictResolution) return;

    // Critical fields require confirmation
    if (isCriticalField(field)) {
      conflictResolution.requestConfirmation(field, value, currentStep);
    } else {
      // Non-critical fields just notify
      conflictResolution.notifyFieldChange(field, value, currentStep);
    }
  };

  return { handleFieldChange };
}
