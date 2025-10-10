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

export type UserRole = 'buyer' | 'seller' | 'both';
