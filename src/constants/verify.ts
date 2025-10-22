import type { IdType } from '@/types/verify';

export const idOptions: { id: IdType; label: string }[] = [
  { id: 'passport', label: 'Passport' },
  { id: 'umid', label: 'UMID' },
  { id: 'philsys', label: 'PhilSys ID' },
  { id: 'drivers_license', label: "Driver's License" },
];

export const maxSizeUploadIDDocument = 10 * 1024 * 1024; // 10 MB

export const LIVENESS_CHECK_STEPS = [
  'Look straight ahead',
  // 'Turn your head to the left',
  // 'Turn your head to the right',
  // 'Smile',
  // 'Blink your eyes',
  // 'Open your mouth',
  // 'Raise your eyebrows',
];

export const BIOMETRICS_INSTRUCTIONS = [
  'Find a well-lit area',
  'Remove glasses, hats, and masks',
  'Look straight at the camera',
  'Follow the on-screen prompts',
  'Ensure face is inside the frame',
];
