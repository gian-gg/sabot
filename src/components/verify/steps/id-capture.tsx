import { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { maxSizeUploadIDDocument } from '@/constants/verify';
import NavigationButtons from '../components/navigation-buttons';
import PreviewForm from '../components/upload-id/preview-form';

import { extractID } from '@/lib/gemini/verify';

import type {
  GovernmentIdInfo,
  StepNavProps,
  UserIDType,
} from '@/types/verify';
import Upload from '../components/upload-id/upload';
import PreviewUpload from '../components/upload-id/preview-upload';

export function IdCapture({
  onNext,
  onPrev,
  selectedIDType,
  setSelectedIDType,
  userData,
  setUserData,
}: StepNavProps & {
  selectedIDType: UserIDType | null;
  setSelectedIDType: (arg: UserIDType | null) => void;
  userData: GovernmentIdInfo | null;
  setUserData: (u: GovernmentIdInfo | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState<GovernmentIdInfo | null>(null);

  // cleanup preview URL when unmounted or changed
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const openFileDialog = () => {
    if (isUploading) return;
    inputRef.current?.click();
  };

  // validate file, show preview, and process data
  const handleFiles = async (files: FileList | null) => {
    if (!selectedIDType?.type) {
      setError('Please select an ID type first.');
      return;
    }
    if (!files || files.length === 0) return;
    if (files.length > 1) {
      setError('Please upload only one file.');
      return;
    }

    const f = files[0];
    const isImage = f.type.startsWith('image/');
    const isPdf = f.type === 'application/pdf';
    if (!isImage && !isPdf) {
      setError('Only images or PDF files are allowed.');
      return;
    }

    if (f.size > maxSizeUploadIDDocument) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setSelectedIDType({ type: selectedIDType.type, file: null });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setSelectedIDType({ type: selectedIDType.type, file: f });

    const data = await extractID(selectedIDType.type, f);

    if (data.notes) {
      console.warn('⚠️ Quality Warning:', data.notes);
    }

    setUserData(data as GovernmentIdInfo);
    setForm(data as GovernmentIdInfo);

    // slight delay to keep spinner visible for better UX
    setTimeout(() => setIsUploading(false), 700);
  };

  // drag & drop handlers
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    setIsDragging(false);
    handleFiles(e.dataTransfer?.files ?? null);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    if (!isDragging) setIsDragging(true);
  };

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    setIsDragging(false);
  };

  // keyboard accessibility for clickable area
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (isUploading) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  };

  const handleBackButton = () => {
    // Clear selected file and preview when going back
    setSelectedIDType({ type: selectedIDType?.type ?? 'passport', file: null });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    setForm(null);
    setUserData(null);
    onPrev && onPrev();
  };

  const handleDisableNext = (): boolean => {
    if (isUploading) return true;
    if (!selectedIDType?.file) return true;
    if (userData?.notes) return true;
    if (!userData) return true;

    // required fields to consider present for progressing.
    // expiryDate is ignored for UMID IDs.
    const requiredFields: Array<keyof GovernmentIdInfo> = [
      'idType',
      'firstName',
      'lastName',
      'idNumber',
      'dateOfBirth',
      'expiryDate',
    ];

    const missing = requiredFields.some((field) => {
      if (field === 'expiryDate' && selectedIDType?.type === 'umid') {
        return false; // ignore expiry for UMID
      }

      const val = (userData as GovernmentIdInfo)[field];

      // idType is not a string so check null/undefined only
      if (field === 'idType') {
        return val === null || val === undefined;
      }

      return val === null || val === undefined || String(val).trim() === '';
    });

    return missing;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photograph your ID</CardTitle>
        <CardDescription>
          Please take a clear photo of the front of your ID. You can upload an
          image or a PDF.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Upload area (shows uploader or preview) */}
        {!selectedIDType?.file ? (
          <Upload
            openFileDialog={openFileDialog}
            onKeyDown={onKeyDown}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            isDragging={isDragging}
            isUploading={isUploading}
          />
        ) : (
          <PreviewUpload
            file={selectedIDType?.file}
            previewUrl={previewUrl}
            isUploading={isUploading}
            openFileDialog={openFileDialog}
            onKeyDown={onKeyDown}
          />
        )}

        {/* Hidden file input used by both states */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          className="hidden"
          disabled={isUploading}
          onChange={(e) => !isUploading && handleFiles(e.currentTarget.files)}
        />

        {/* Error message */}
        {error && (
          <p className="text-destructive mb-4 text-sm" role="alert">
            {error}
          </p>
        )}

        {/* Extracted details form (editable) */}
        {form && (
          <PreviewForm
            extractedData={userData}
            setUserData={setUserData}
            setForm={setForm}
          />
        )}

        <ul className="text-muted-foreground mt-4 mb-6 list-inside list-disc space-y-1 text-sm">
          <li>Avoid glare and shadows.</li>
          <li>Use a well-lit area.</li>
          <li>Ensure all text is readable.</li>
        </ul>

        {/* Navigation buttons */}
        <NavigationButtons
          onNext={onNext}
          disableNext={handleDisableNext()}
          onPrev={handleBackButton}
          isUploading={isUploading}
        />
      </CardContent>
    </Card>
  );
}
