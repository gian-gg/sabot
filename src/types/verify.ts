export type VerificationStep =
  | 'ID_SELECTION'
  | 'ID_CAPTURE'
  | 'BIOMETRIC_CAPTURE'
  | 'SUBMISSION_REVIEW'
  | 'SUBMISSION_PENDING';

export interface StepNavProps {
  onNext: () => void;
  onPrev?: () => void;
}

export type IdType = 'passport' | 'umid' | 'philsys' | 'drivers_license';

export type UserIDType = {
  type: IdType;
  file: File | null;
};

export type GovernmentIdInfo = {
  idType: IdType | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  idNumber: string | null;
  dateOfBirth: string | null; // Format: YYYY-MM-DD
  issueDate: string | null; // Format: YYYY-MM-DD
  expiryDate: string | null; // Format: YYYY-MM-DD
  address: string | null;
  sex: string | null;
  notes?: string;
};
