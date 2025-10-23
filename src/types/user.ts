export type VerificationStatus = 'not-started' | 'pending' | 'complete';

export type UserRole = 'user' | 'admin';

export interface UserVerificationData {
  verification_status: VerificationStatus;
  role: UserRole;
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
  verificationStatus: VerificationStatus;
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
