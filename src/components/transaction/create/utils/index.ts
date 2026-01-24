import type {
  TransactionFormData,
  FieldLocks,
  AnalysisWithSource,
} from '../types';
import type { EnhancedEscrowData } from '@/components/agreement/finalize/escrow-protection-enhanced';
import type { AnalysisData } from '@/types/analysis';
import { FORM_STATE_EXPIRY_MS } from '../constants';

/**
 * Saved form state structure for localStorage persistence
 */
export interface SavedFormState {
  currentStep: number;
  formData: TransactionFormData;
  fieldLocks: FieldLocks;
  conflictsWereResolved: boolean;
  analysisCompleted: boolean;
  extractedData: AnalysisData | null;
  multipleAnalyses: AnalysisWithSource[];
  hasConflicts: boolean;
  bothPartiesReady: boolean;
  escrowEnabled: boolean;
  arbiterEnabled: boolean;
  escrowData: EnhancedEscrowData;
  currentUserConfirmedStep3: boolean;
  waitingForOtherParty: boolean;
  savedAt: number;
}

/**
 * Generate storage key for form state persistence
 */
export function getFormStorageKey(
  transactionId?: string,
  currentUserId?: string | null,
  otherUserId?: string | null
): string {
  if (transactionId) {
    return `transaction-form-${transactionId}`;
  }
  return `transaction-form-${currentUserId || 'temp'}-${otherUserId || 'temp'}`;
}

/**
 * Save form state to localStorage
 */
export function saveFormState(
  key: string,
  state: Omit<SavedFormState, 'savedAt'>
): void {
  if (typeof window === 'undefined') return;

  try {
    const stateWithTimestamp: SavedFormState = {
      ...state,
      savedAt: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.error('Failed to save form state:', error);
  }
}

/**
 * Load form state from localStorage
 * Returns null if no valid state found or state is expired
 */
export function loadFormState(key: string): SavedFormState | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const state = JSON.parse(saved) as SavedFormState;
      // Only load if saved within expiry time
      if (state.savedAt && Date.now() - state.savedAt < FORM_STATE_EXPIRY_MS) {
        return state;
      }
    }
  } catch (error) {
    console.error('Failed to load form state:', error);
  }
  return null;
}

/**
 * Clear saved form state from localStorage
 */
export function clearFormState(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear form state:', error);
  }
}

/**
 * Get human-readable display name for a form field
 */
export function getFieldDisplayName(field: string): string {
  const displayNames: Record<string, string> = {
    item_name: 'Item Name',
    product_model: 'Product Model',
    item_description: 'Description',
    price: 'Price',
    quantity: 'Quantity',
    condition: 'Condition',
    category: 'Category',
    transaction_type: 'Transaction Type',
    meeting_location: 'Meeting Location',
    meeting_time: 'Meeting Time',
    delivery_address: 'Delivery Address',
    delivery_method: 'Delivery Method',
    online_platform: 'Online Platform',
    online_contact: 'Online Contact',
    online_instructions: 'Online Instructions',
  };
  return (
    displayNames[field] ||
    field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

/**
 * Check if a field value is considered empty
 */
export function isFieldEmpty(value: string | undefined): boolean {
  return !value || value.trim() === '';
}

/**
 * Validate step 3 (Item Details) completion
 */
export function validateStep3(
  formData: TransactionFormData,
  fieldLocks: FieldLocks,
  requiredFields: (keyof TransactionFormData)[]
): boolean {
  const hasRequiredFields = requiredFields.every(
    (field) => !isFieldEmpty(formData[field] as string)
  );

  const allRequiredFieldsLocked = requiredFields.every((field) => {
    if (formData[field]) {
      return fieldLocks[field];
    }
    return true; // Empty fields don't need to be locked
  });

  return hasRequiredFields && allRequiredFieldsLocked;
}

/**
 * Validate step 4 (Exchange Info) completion
 */
export function validateStep4(formData: TransactionFormData): boolean {
  switch (formData.transaction_type) {
    case 'meetup':
      return (
        !isFieldEmpty(formData.meeting_location) &&
        !isFieldEmpty(formData.meeting_time)
      );
    case 'delivery':
      return (
        !isFieldEmpty(formData.delivery_address) &&
        !isFieldEmpty(formData.delivery_method)
      );
    case 'online':
      return true; // All online fields are optional
    default:
      return false;
  }
}

/**
 * Validate step 5 (Safety Options) completion
 */
export function validateStep5(
  escrowEnabled: boolean,
  escrowData: EnhancedEscrowData,
  arbiterEnabled: boolean
): boolean {
  if (escrowEnabled) {
    // Must have at least one deliverable
    if (escrowData.deliverables.length === 0) {
      return false;
    }
    // Cash/digital transfer deliverables should have value and currency
    const paymentDeliverables = escrowData.deliverables.filter(
      (d) => d.type === 'cash' || d.type === 'digital_transfer'
    );
    const allPaymentsValid = paymentDeliverables.every(
      (d) => d.value && d.currency
    );
    if (!allPaymentsValid) {
      return false;
    }
  }

  // Arbiter validation: if enabled, must have selected an arbiter
  if (arbiterEnabled && !escrowData.arbiter_id) {
    return false;
  }

  return true;
}
