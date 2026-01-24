/**
 * Transaction Create Form Module
 *
 * Modular components for the multi-step transaction creation wizard.
 * This module is designed to replace the monolithic create-transaction-form.tsx.
 */

// Types
export type {
  FormStep,
  Step3ConfirmationData,
  TransactionFormData,
  AnalysisWithSource,
  FieldLocks,
  CreateTransactionFormProps,
  FieldLockData,
  FormFieldChangeData,
  ChangeResponseData,
  TrackedChange,
} from './types';

// Constants
export {
  FORM_STEPS,
  INITIAL_FORM_DATA,
  INITIAL_FIELD_LOCKS,
  STEP_3_REQUIRED_FIELDS,
  FORM_STATE_EXPIRY_MS,
  FIELD_SYNC_DEBOUNCE_MS,
  DUPLICATE_CALL_THRESHOLD_MS,
  PRODUCT_CATEGORIES,
  CONDITION_OPTIONS,
  DELIVERY_METHODS,
} from './constants';

// Utilities
export {
  getFormStorageKey,
  saveFormState,
  loadFormState,
  clearFormState,
  getFieldDisplayName,
  isFieldEmpty,
  validateStep3,
  validateStep4,
  validateStep5,
  type SavedFormState,
} from './utils';
