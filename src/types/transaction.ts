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
  created_at: string;
  updated_at: string;
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
}

export interface TransactionScreenshot {
  id: string;
  transaction_id: string;
  user_id: string;
  file_path: string;
  file_size?: number;
  uploaded_at: string;
}

export interface TransactionWithParticipants extends DBTransaction {
  participants: TransactionParticipant[];
}

export interface CreateTransactionPayload {
  item_name?: string;
  item_description?: string;
  price?: number;
  meeting_location?: string;
  meeting_time?: string;
}

export interface JoinTransactionPayload {
  transaction_id: string;
}

export interface UploadScreenshotPayload {
  transaction_id: string;
  file: File;
}

export interface TransactionStatusResponse {
  transaction: DBTransaction;
  participants: TransactionParticipant[];
  current_user_role?: ParticipantRole;
  is_ready_for_next_step: boolean;
}
