import type { LucideIcon } from 'lucide-react';
import type { AnalysisData } from '@/types/analysis';
import type { useSharedConflictResolution } from '@/hooks/use-shared-conflict-resolution';

/**
 * Multi-step form wizard step configuration
 */
export interface FormStep {
  id: number;
  name: string;
  icon: LucideIcon;
}

/**
 * Confirmation data for step 3 transition agreement
 */
export interface Step3ConfirmationData {
  confirmations: Record<string, { confirmed: boolean; timestamp: number }>;
}

/**
 * Form data for transaction creation
 */
export interface TransactionFormData {
  item_name: string;
  product_model: string;
  item_description: string;
  price: string;
  quantity: string;
  condition: string;
  category: string;
  transaction_type: 'meetup' | 'delivery' | 'online';
  meeting_location: string;
  meeting_time: string;
  delivery_address?: string;
  delivery_method?: string;
  online_platform?: string;
  online_contact?: string;
  online_instructions?: string;
}

/**
 * Analysis data with source tracking for multiple screenshots
 */
export interface AnalysisWithSource extends AnalysisData {
  source: string;
  screenshotId: string;
}

/**
 * Field lock state for collaborative editing
 */
export type FieldLocks = Record<keyof TransactionFormData, boolean>;

/**
 * Props for the CreateTransactionForm component
 */
export interface CreateTransactionFormProps {
  transactionId?: string;
  onTransactionCreated?: (id: string) => void;
  conflictResolution?: ReturnType<typeof useSharedConflictResolution>;
  userId?: string;
  userName?: string;
}

/**
 * Field lock data structure for sync
 */
export interface FieldLockData {
  field: keyof FieldLocks;
  locked: boolean;
  userId: string;
  timestamp: number;
}

/**
 * Form field change data for collaborative editing
 */
export interface FormFieldChangeData {
  field: keyof TransactionFormData;
  value: string;
  userId: string;
  timestamp: number;
  messageId?: string;
}

/**
 * Change response data for approval workflow
 */
export interface ChangeResponseData {
  messageId: string;
  confirmed: boolean;
  userId: string;
  timestamp: number;
}

/**
 * Tracked change for sent change proposals
 */
export interface TrackedChange {
  field: keyof TransactionFormData;
  newValue: string;
  oldValue: string;
}
