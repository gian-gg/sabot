'use server';

import { createClient } from '../server';
import type {
  VerificationRequests,
  GovernmentIdInfo,
  IdType,
} from '@/types/verify';
import type { VerificationStatus } from '@/types/user';
import { uploadToBucket } from '../storage';

interface VerificationRequestRow {
  id: string;
  status: VerificationStatus;
  user_id: string;
  user_name: string;
  user_email: string;
  id_type: IdType;
  face_match: number;
  user_govid_path: string;
  user_govid_info: GovernmentIdInfo;
  created_at: string;
}

export async function getVerificationRequests(): Promise<
  VerificationRequests[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('verification_requests')
    .select(
      `
        id,
        status,
        user_id,
        user_name,
        user_email,
        id_type,
        face_match,
        user_govid_path,
        user_govid_info,
        created_at
        `
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching verification requests:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  const mappedData: VerificationRequests[] = (
    data as VerificationRequestRow[]
  ).map((item) => ({
    id: item.id,
    status: item.status,
    userID: item.user_id,
    userName: item.user_name,
    userEmail: item.user_email,
    userGovIDPath: item.user_govid_path,
    governmentIdInfo: item.user_govid_info,
    faceMathchConfidence: item.face_match,
    createdAt: item.created_at,
  }));

  return mappedData;
}

// Input type for submitting a new verification request
export type SubmitVerificationRequestInput = {
  userID: string;
  userName: string;
  userEmail: string;
  idType: IdType;
  govIdFile: File | Blob | Uint8Array | ArrayBuffer;
  governmentIdInfo: GovernmentIdInfo;
  faceMatchConfidence: number;
};

export async function submitVerificationRequest(
  input: SubmitVerificationRequestInput
): Promise<VerificationRequests> {
  const supabase = await createClient();

  // 1) Upload file to storage bucket (folder per user)
  const fileName =
    typeof File !== 'undefined' && input.govIdFile instanceof File
      ? input.govIdFile.name
      : 'government-id';

  const { storagePath } = await uploadToBucket({
    bucket: 'verification-ids',
    content: input.govIdFile,
    fileName,
    pathPrefix: `${input.userID}/`,
    upsert: false,
  });

  // 3) Insert row
  const { data, error } = await supabase
    .from('verification_requests')
    .insert({
      status: 'pending' as VerificationStatus,
      user_id: input.userID,
      user_name: input.userName,
      user_email: input.userEmail,
      id_type: input.idType,
      face_match: input.faceMatchConfidence ?? 0,
      user_govid_path: storagePath,
      user_govid_info: input.governmentIdInfo,
    })
    .select(
      `
      id,
      status,
      user_id,
      user_name,
      user_email,
      id_type,
      face_match,
      user_govid_path,
      user_govid_info,
      created_at
      `
    )
    .single();

  if (error) {
    throw new Error(`Failed to create verification request: ${error.message}`);
  }

  // 4) Map to domain type
  const row = data as VerificationRequestRow;
  return {
    id: row.id,
    status: row.status,
    userID: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    userGovIDPath: row.user_govid_path,
    governmentIdInfo: row.user_govid_info,
    faceMathchConfidence: row.face_match,
    createdAt: row.created_at,
  };
}
