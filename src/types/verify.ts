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
