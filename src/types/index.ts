/**
 * Central barrel export for all type definitions
 */

// Agreement types - export ParticipantRole as AgreementParticipantRole
export type {
  AgreementStatus,
  AgreementType,
  ParticipantRole as AgreementParticipantRole,
  DBAgreement,
  AgreementParticipant,
  AgreementContent,
  IdeaBlock,
  AgreementWithParticipants,
  CreateAgreementPayload,
  JoinAgreementPayload,
  UpdateAgreementConfirmationPayload,
  UpdateAgreementContentPayload,
  AgreementStatusResponse,
} from './agreement';

export * from './analysis';
export * from './blockchain';
export * from './conversation';

// Escrow types
export * from './escrow';

export * from './profile';
export * from './report';

// Transaction types - export ParticipantRole as TransactionParticipantRole
export type {
  TransactionStatus,
  TransactionType,
  TransactionMethod,
  ParticipantRole as TransactionParticipantRole,
  Transaction,
  DBTransaction,
  TransactionDetails,
  TransactionParticipant,
  TransactionScreenshot,
  TransactionComment,
  TransactionWithParticipants,
  CreateTransactionPayload,
  JoinTransactionPayload,
  UploadScreenshotPayload,
  CreateCommentPayload,
  UpdateCommentPayload,
  TransactionStatusResponse,
  UserRole,
} from './transaction';
export { PRICE_CONSTRAINTS, validatePrice } from './transaction';

export * from './user';
export * from './verify';

export interface SimpleUser {
  id: string;
  email: string;
  image: string;
  name: string;
  verificationStatus: import('./user').VerificationStatus;
  role: import('./user').UserRole;
}

/**
 * Supabase Auth user type
 * Represents the user object returned by supabase.auth.getUser()
 */
export interface AuthUser {
  id: string;
  user_metadata: {
    avatar_url: string;
    full_name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
}
