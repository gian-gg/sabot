'use server';

import { createClient } from '../server';
import type {
  VerificationRequests,
  GovernmentIdInfo,
  IdType,
} from '@/types/verify';
import { uploadToBucket, deleteFromBucket } from '../storage';
import {
  getUserVerificationData,
  updateUserVerificationStatus,
  getUsersVerificationMap,
} from './user';

interface VerificationRequestRow {
  id: string;
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

  const rows = data as VerificationRequestRow[];
  const userIds = rows.map((r) => r.user_id);
  const statusMap = await getUsersVerificationMap(userIds);

  const mappedData: VerificationRequests[] = rows.map((item) => ({
    id: item.id,
    status: statusMap[item.user_id] ?? 'not-started',
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

  // 4) Mark user status as pending (source of truth in user_data)
  await updateUserVerificationStatus(input.userID, 'pending');

  // 5) Map to domain type
  const row = data as VerificationRequestRow;
  const userData = await getUserVerificationData(row.user_id);
  return {
    id: row.id,
    status: userData.verification_status,
    userID: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    userGovIDPath: row.user_govid_path,
    governmentIdInfo: row.user_govid_info,
    faceMathchConfidence: row.face_match,
    createdAt: row.created_at,
  };
}

// Delete a verification request entry by id
export async function deleteVerificationRequest(id: string): Promise<boolean> {
  const supabase = await createClient();

  // Fetch the row to get the storage path
  const { data: row, error: fetchError } = await supabase
    .from('verification_requests')
    .select('user_govid_path')
    .eq('id', id)
    .single();

  if (fetchError || !row) {
    console.error(
      'Error fetching verification request for delete:',
      fetchError
    );
    return false;
  }

  // Try deleting the storage file first
  const storageDeleted = await deleteFromBucket(
    'verification-ids',
    row.user_govid_path
  );
  if (!storageDeleted) {
    // Proceed to delete DB row anyway, but report partial failure
    console.warn(
      'Proceeding to delete DB row despite storage deletion failure'
    );
  }

  const { error: deleteError } = await supabase
    .from('verification_requests')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Error deleting verification request row:', deleteError);
    return false;
  }

  return true;
}
