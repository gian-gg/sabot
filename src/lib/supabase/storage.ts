'use server';

import { createClient } from './server';

export type UploadInput = {
  bucket: string;
  // File-like content. File and Blob are supported in the Web/File API; Uint8Array covers buffers.
  content: File | Blob | Uint8Array | ArrayBuffer;
  // The original filename (to preserve extension); used to build the storage path
  fileName: string;
  // Optional folder prefix like "user-123/" (will be normalized)
  pathPrefix?: string;
  // Optional content type; if not provided and content is File/Blob, we'll use content.type
  contentType?: string;
  // Whether to overwrite existing files with the same path
  upsert?: boolean;
};

export type UploadResult = {
  storagePath: string;
  publicUrl: string | null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function compressImage(file: File | Blob): Promise<Blob> {
  // Return original if not an image
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if too large
      if (width > 1920) {
        height = (height * 1920) / width;
        width = 1920;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
    };
    img.src = URL.createObjectURL(file);
  });
}

function sanitizeSegment(segment: string): string {
  return segment.replace(/\\/g, '/').replace(/[^a-zA-Z0-9._/-]/g, '_');
}

function joinPath(prefix: string | undefined, fileName: string): string {
  const safePrefix = prefix
    ? sanitizeSegment(prefix).replace(/^\/+|\/+$/g, '')
    : '';
  const safeName = sanitizeSegment(fileName).replace(/^\/+/, '');
  const parts = [safePrefix, `${Date.now()}-${safeName}`].filter(Boolean);
  return parts.join('/');
}

export async function uploadToBucket(
  input: UploadInput
): Promise<UploadResult> {
  const supabase = await createClient();
  const { bucket, content, fileName, pathPrefix, contentType, upsert } = input;

  let processedContent = content;

  // Compress images before upload if they're too large
  if (
    (content instanceof File || content instanceof Blob) &&
    content.size > MAX_FILE_SIZE
  ) {
    processedContent = await compressImage(content);
  }

  const path = joinPath(pathPrefix, fileName);

  // Detect content type
  let detectedType: string | undefined = contentType;
  if (!detectedType && typeof File !== 'undefined' && content instanceof File) {
    detectedType = content.type || undefined;
  } else if (
    !detectedType &&
    typeof Blob !== 'undefined' &&
    content instanceof Blob
  ) {
    detectedType = content.type || undefined;
  }

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, content, { contentType: detectedType, upsert: !!upsert });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return {
    storagePath: path,
    publicUrl: pub?.publicUrl ?? null,
  };
}

// Delete a file from a bucket by path
export async function deleteFromBucket(
  bucket: string,
  path: string
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error('Failed to delete storage file:', error.message);
    return false;
  }
  return true;
}

/**
 * Creates a signed URL for private storage files that expires after a set duration
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL that can be used to access the private file
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Failed to create signed URL:', error.message);
    return null;
  }

  return data?.signedUrl ?? null;
}
