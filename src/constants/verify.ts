import type { IdType } from '@/types/verify';

export const VERIFY_STEPS = [
  { id: 'ID_SELECTION', title: 'Select ID' },
  { id: 'ID_CAPTURE', title: 'Upload ID' },
  { id: 'BIOMETRIC_CAPTURE', title: 'Biometrics' },
  { id: 'SUBMISSION_REVIEW', title: 'Review' },
];

export const idOptions: { id: IdType; label: string }[] = [
  { id: 'passport', label: 'Passport' },
  { id: 'umid', label: 'UMID' },
  { id: 'philsys', label: 'PhilSys ID' },
  { id: 'drivers_license', label: "Driver's License" },
];

export const maxSizeUploadIDDocument = 10 * 1024 * 1024; // 10 MB

export const LIVENESS_CHECK_STEPS_FIXED = [
  'Look straight ahead',
  'Turn your head to the left',
  'Turn your head to the right',
];

export const LIVENESS_CHECK_STEPS_RANDOM = [
  'Smile',
  'Open your mouth',
  'Raise your eyebrows',
  'Close your eyes',
];

export const LIVENESS_CHECK_MAX_STEPS = 4;

export const BIOMETRICS_INSTRUCTIONS = [
  'Find a well-lit area',
  'Remove glasses, hats, and masks',
  'Look straight at the camera',
  'Follow the on-screen prompts',
  'Ensure face is inside the frame',
];
