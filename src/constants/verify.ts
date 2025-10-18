import type { IdType } from '@/types/verify';

export const idOptions: { id: IdType; label: string }[] = [
  { id: 'passport', label: 'Passport' },
  { id: 'umid', label: 'UMID' },
  { id: 'philsys', label: 'PhilSys ID' },
  { id: 'drivers_license', label: "Driver's License" },
];

export const maxSizeUploadIDDocument = 10 * 1024 * 1024; // 10 MB
