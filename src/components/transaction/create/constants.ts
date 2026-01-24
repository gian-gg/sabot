import { CheckCircle2, GitMerge, MapPin, Package, Shield } from 'lucide-react';
import type { FormStep, TransactionFormData, FieldLocks } from './types';

/**
 * Form wizard steps configuration
 */
export const FORM_STEPS: FormStep[] = [
  { id: 1, name: 'Convo Analysis', icon: Shield },
  { id: 2, name: 'Resolve Conflicts', icon: GitMerge },
  { id: 3, name: 'Item Details', icon: Package },
  { id: 4, name: 'Exchange Info', icon: MapPin },
  { id: 5, name: 'Safety Options', icon: Shield },
  { id: 6, name: 'Review', icon: CheckCircle2 },
];

/**
 * Initial form data values
 */
export const INITIAL_FORM_DATA: TransactionFormData = {
  item_name: '',
  product_model: '',
  item_description: '',
  price: '',
  quantity: '1',
  condition: '',
  category: '',
  transaction_type: 'meetup',
  meeting_location: '',
  meeting_time: '',
  delivery_address: '',
  delivery_method: '',
  online_platform: '',
  online_contact: '',
  online_instructions: '',
};

/**
 * Initial field lock state - all fields unlocked
 */
export const INITIAL_FIELD_LOCKS: FieldLocks = {
  item_name: false,
  product_model: false,
  item_description: false,
  price: false,
  quantity: false,
  condition: false,
  category: false,
  transaction_type: false,
  meeting_location: false,
  meeting_time: false,
  delivery_address: false,
  delivery_method: false,
  online_platform: false,
  online_contact: false,
  online_instructions: false,
};

/**
 * Required fields for step 3 validation
 */
export const STEP_3_REQUIRED_FIELDS: (keyof TransactionFormData)[] = [
  'item_name',
  'price',
  'condition',
  'category',
];

/**
 * Form state expiry time (24 hours in ms)
 */
export const FORM_STATE_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * Debounce delay for field sync (ms)
 */
export const FIELD_SYNC_DEBOUNCE_MS = 500;

/**
 * Duplicate call prevention threshold (ms)
 */
export const DUPLICATE_CALL_THRESHOLD_MS = 100;

/**
 * Product categories for the form
 */
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing & Accessories',
  'Home & Garden',
  'Sports & Outdoors',
  'Toys & Games',
  'Books & Media',
  'Collectibles',
  'Vehicles & Parts',
  'Other',
] as const;

/**
 * Item condition options
 */
export const CONDITION_OPTIONS = [
  { value: 'new', label: 'Brand New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
] as const;

/**
 * Delivery method options
 */
export const DELIVERY_METHODS = [
  'Standard Shipping',
  'Express Shipping',
  'Same-Day Delivery',
  'Courier',
  'Other',
] as const;
