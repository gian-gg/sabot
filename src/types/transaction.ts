export type TransactionStatus =
  | 'completed'
  | 'active'
  | 'pending'
  | 'reported'
  | 'disputed'
  | 'waiting_for_participant'
  | 'both_joined'
  | 'screenshots_uploaded'
  | 'cancelled';

export type TransactionType =
  | 'electronics'
  | 'services'
  | 'fashion'
  | 'home-goods'
  | 'vehicles'
  | 'collectibles'
  | 'other';

export type TransactionMethod = 'meetup' | 'online' | 'other';

export type ParticipantRole = 'creator' | 'invitee';

export interface Transaction {
  id: string;
  type: TransactionType;
  buyerName: string;
  sellerName: string;
  proposedPrice: number;
  currency: string;
  status: TransactionStatus;
  transactionType: TransactionMethod;
  productModel: string;
  productCondition: string;
  meetupLocation: string;
  timestamp: Date;
  platform?: string;
}

// Database transaction types for real-time flow
export interface DBTransaction {
  id: string;
  creator_id: string;
  status: TransactionStatus;
  item_name?: string;
  item_description?: string;
  price?: number;
  meeting_location?: string;
  meeting_time?: string;
  delivery_address?: string;
  delivery_method?: string;
  online_platform?: string;
  online_contact?: string;
  online_instructions?: string;
  transaction_type?: 'meetup' | 'delivery' | 'online';
  category?: string;
  condition?: string;
  quantity?: number;
  created_at: string;
  updated_at: string;
}

// for transaction details section
export interface TransactionDetails {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_email: string;
  creator_avatar_url: string | null | undefined;
  status: TransactionStatus;
  item_name: string;
  item_description: string;
  price: number;
  meeting_location: string | null | undefined;
  meeting_time: string | null | undefined;
  delivery_address: string | null | undefined;
  delivery_method: string | null | undefined;
  online_platform: string | null | undefined;
  online_contact: string | null | undefined;
  online_instructions: string | null | undefined;
  category: string;
  condition: string;
  quantity: number;
  transaction_type: 'meetup' | 'delivery' | 'online';
  hash: string | null | undefined;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  transaction_participants: TransactionParticipant[];
  comments?: TransactionComment[];
  comment_count?: number;
}

export interface TransactionParticipant {
  id: string;
  transaction_id: string;
  user_id: string;
  role: ParticipantRole;
  screenshot_uploaded: boolean;
  screenshot_url?: string;
  joined_at: string;
  // Enriched profile fields (added by API)
  name?: string;
  email?: string;
  avatar?: string;
  // Confirmation fields
  has_confirmed?: boolean;
  confirmed_at?: string;
  participant_name?: string;
  participant_email?: string;
  participant_avatar_url?: string;
  // Deliverable confirmation fields
  item_confirmed?: boolean;
  payment_confirmed?: boolean;
  item_confirmed_at?: string;
  payment_confirmed_at?: string;
}

export interface TransactionScreenshot {
  id: string;
  transaction_id: string;
  user_id: string;
  file_path: string;
  file_size?: number;
  uploaded_at: string;
}

export interface TransactionComment {
  id: string;
  transaction_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string | null;
  edited_at?: string | null;
  created_at: string;
  updated_at: string;
  // Enriched fields (added by API)
  user_name?: string;
  user_email?: string;
  user_avatar_url?: string | null;
  replies?: TransactionComment[];
}

export interface TransactionWithParticipants extends DBTransaction {
  participants: TransactionParticipant[];
}

// Price validation constraints
export const PRICE_CONSTRAINTS = {
  MIN: 0.01,
  MAX: 99999999.99,
  DECIMAL_PLACES: 2,
} as const;

// Validate price and return if valid
export function validatePrice(price: unknown): number {
  const num = typeof price === 'string' ? parseFloat(price) : (price as number);

  if (!Number.isFinite(num)) {
    throw new Error('Price must be a valid number');
  }
  if (num < PRICE_CONSTRAINTS.MIN) {
    throw new Error(`Price must be at least ${PRICE_CONSTRAINTS.MIN}`);
  }
  if (num > PRICE_CONSTRAINTS.MAX) {
    throw new Error(`Price cannot exceed ${PRICE_CONSTRAINTS.MAX}`);
  }
  if (!Number.isInteger(num * 100)) {
    throw new Error(
      `Price can only have up to ${PRICE_CONSTRAINTS.DECIMAL_PLACES} decimal places`
    );
  }

  return Math.round(num * 100) / 100;
}

export interface CreateTransactionPayload {
  item_name?: string;
  item_description?: string;
  price?: number;
  meeting_location?: string;
  meeting_time?: string;
  delivery_address?: string;
  delivery_method?: string;
  online_platform?: string;
  online_contact?: string;
  online_instructions?: string;
  transaction_type?: 'meetup' | 'delivery' | 'online';
  category?: string;
  condition?: string;
  quantity?: number;
}

export interface JoinTransactionPayload {
  transaction_id: string;
}

export interface UploadScreenshotPayload {
  transaction_id: string;
  file: File;
}

export interface CreateCommentPayload {
  transaction_id: string;
  content: string;
  parent_comment_id?: string;
}

export interface UpdateCommentPayload {
  comment_id: string;
  content: string;
}

// Import types from escrow module
import type {
  EscrowWithDeliverables,
  DeliverableWithStatus,
  OracleVerification,
} from './escrow';

export interface TransactionStatusResponse {
  transaction: DBTransaction;
  participants: TransactionParticipant[];
  current_user_role?: ParticipantRole;
  is_ready_for_next_step: boolean;
  escrow?: EscrowWithDeliverables;
  deliverable_statuses?: DeliverableWithStatus[];
  oracle_verifications?: OracleVerification[];
  pushToBlock?: string | null; // Added property
}

export interface UserRole {
  user_id: string;
  role: string;
}

export interface TransactionQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TransactionStatus | 'all';
  type?: 'all' | 'meetup' | 'delivery' | 'online';
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'created_at' | 'price' | 'item_name';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTransactionResponse {
  transactions: TransactionDetails[];
  totalCount: number;
  page: number;
  pageSize: number;
}
