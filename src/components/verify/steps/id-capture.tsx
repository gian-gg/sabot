import { useMemo, useRef, useState } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

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

  const openFileDialog = () => {
    if (isUploading) return;
    inputRef.current?.click();
  };

  // validate file, show preview, and process data
  const handleFiles = async (files: FileList | null) => {
    if (!selectedIDType?.type) return;
    if (!files || files.length === 0) return;
    if (files.length > 1) return;

    const f = files[0];

    setIsUploading(true);
    setSelectedIDType({ type: selectedIDType.type, file: null });
    setSelectedIDType({ type: selectedIDType.type, file: f });

    const data = await extractID(selectedIDType.type, f);

    setUserData(data as GovernmentIdInfo);

    // slight delay to keep spinner visible for better UX
    setTimeout(() => {
      setIsUploading(false);
    }, 700);
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
    setUserData(null);
    if (onPrev) onPrev();
  };

  const handleDisableNext = (): boolean => {
    if (isUploading) return true;

    return getMissingRequirements().length > 0;
  };

  // Compute specific missing requirements to help users proceed
  const getMissingRequirements = useMemo(() => {
    if (userData?.notes) return () => [];

    return () => {
      const missing: string[] = [];

      if (!selectedIDType?.type) {
        missing.push('Select an ID type.');
      }

      if (!selectedIDType?.file) {
        missing.push('Upload a clear photo or PDF of your ID.');
      }

      // If we have extracted data, ensure required fields are present
      if (userData) {
        const labelMap: Record<keyof GovernmentIdInfo, string> = {
          idType: 'ID type',
          firstName: 'First name',
          lastName: 'Last name',
          middleName: 'Middle name',
          idNumber: 'ID number',
          dateOfBirth: 'Date of birth',
          issueDate: 'Issue date',
          expiryDate: 'Expiry date',
          address: 'Address',
          sex: 'Sex',
          notes: 'Notes',
        } as const;

        const requiredFields: Array<keyof GovernmentIdInfo> = [
          'firstName',
          'lastName',
          'idNumber',
          'dateOfBirth',
          'issueDate',
          'sex',
          'address',
          'issueDate',
          'expiryDate',
        ];

        for (const field of requiredFields) {
          const val = (userData as GovernmentIdInfo)[field];
          const empty =
            val === null || val === undefined || String(val).trim() === '';
          if (empty) missing.push(`${labelMap[field]} is required.`);
        }
      }

      return missing;
    };
  }, [selectedIDType?.type, selectedIDType?.file, userData]);

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

        {/* Extracted details form (editable) */}
        {userData && (
          <PreviewForm extractedData={userData} setUserData={setUserData} />
        )}

        {/* Guidance alert for missing requirements */}
        {!isUploading && handleDisableNext() && (
          <Alert
            variant="destructive"
            className="border-destructive bg-destructive/5 mt-2 mb-6"
          >
            <AlertTriangle className="mt-0.5 size-4" />
            <AlertTitle>Complete these items to continue</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc space-y-1">
                {getMissingRequirements().map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

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
