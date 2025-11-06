import { TransactionStatus, TransactionType } from './transaction';

/**
 * Transaction history item for profile view
 */
export interface ProfileTransaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  title: string;
  amount?: number;
  currency?: string;
  counterpartyName: string;
  completedAt?: string;
  createdAt: string;
}

/**
 * User profile statistics
 */
export interface UserProfileStats {
  totalTransactions: number;
  completedTransactions: number;
  activeTransactions: number;
  trustScore: number;
  rating: number;
  joinDate: string;
  responseTime?: string;
  completionRate?: number;
}

/**
 * Public user profile data
 */
export interface PublicUserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isVerified: boolean;
  stats: UserProfileStats;
  recentTransactions: ProfileTransaction[];
  memberSince: string;
}
