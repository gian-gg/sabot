export type VerificationStatus =
  | 'rejected'
  | 'pending'
  | 'verified'
  | 'not-started';

export type UserRole = 'user' | 'admin';

export interface UserVerificationData {
  verification_status: VerificationStatus;
  role: UserRole;
  has_seen_gas_fee_warning?: boolean;
}

export interface SessionType {
  session: {
    user: {
      name: string;
      email: string;
      image?: string;
      id?: string;
    };
  } | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isVerified: boolean;
  rating: number;
  joinDate: Date;
  transactionCount: number;
  trustScore?: number; // Only visible to buyers viewing seller profiles
  emergencyContact?: EmergencyContact;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}
