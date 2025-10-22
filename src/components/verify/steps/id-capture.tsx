import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
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

import { verifyUserId } from '@/lib/gemini/verify';

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

  const openFileDialog = useCallback(() => {
    if (isUploading) return;
    inputRef.current?.click();
  }, [isUploading]);

  // validate file, show preview, and process data
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      setUserData(null);
      if (!files || files.length === 0) return;
      if (files.length > 1) {
        toast.error('Please upload only one file.');
        return;
      }

      const f = files[0];

      // Validate type
      const isImage = f.type.startsWith('image/');
      const isPdf = f.type === 'application/pdf';
      if (!isImage && !isPdf) {
        toast.error('Only images or PDF files are allowed.');
        return;
      }

      // Validate size
      if (f.size > maxSizeUploadIDDocument) {
        toast.error('File is too large. Maximum size is 10MB.');
        return;
      }

      // Require an ID type before processing
      if (!selectedIDType?.type) {
        toast.error('Please select an ID type first.');
        return;
      }

      setIsUploading(true);
      setSelectedIDType({ type: selectedIDType.type, file: f });

      try {
        const data = await verifyUserId(selectedIDType.type, f);
        setUserData(data as GovernmentIdInfo);
      } finally {
        // small delay to show spinner for perceived responsiveness
        setTimeout(() => setIsUploading(false), 400);
      }
    },
    [selectedIDType?.type, setSelectedIDType, setUserData]
  );

  // drag & drop handlers
  const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isUploading) return;
      setIsDragging(false);
      handleFiles(e.dataTransfer?.files ?? null);
    },
    [handleFiles, isUploading]
  );

  const onDragOver: React.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isUploading) return;
      if (!isDragging) setIsDragging(true);
    },
    [isDragging, isUploading]
  );

  const onDragLeave: React.DragEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isUploading) return;
      setIsDragging(false);
    },
    [isUploading]
  );

  // keyboard accessibility for clickable area
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (isUploading) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFileDialog();
      }
    },
    [isUploading, openFileDialog]
  );

  const handleBackButton = useCallback(() => {
    // Clear selected file and preview when going back
    setSelectedIDType({ type: selectedIDType?.type ?? 'passport', file: null });
    setUserData(null);
    if (onPrev) onPrev();
  }, [onPrev, selectedIDType?.type, setSelectedIDType, setUserData]);

  const missingRequirements = useMemo(() => {
    const missing: string[] = [];

    if (!userData?.notes) {
      if (!selectedIDType?.type) {
        missing.push('Select an ID type.');
      }

      if (!selectedIDType?.file) {
        missing.push('Upload a clear photo or PDF of your ID.');
      }

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
        ];

        if (selectedIDType?.type !== 'umid') {
          requiredFields.push('expiryDate');
        }

        // Check for required fields
        for (const field of requiredFields) {
          const val = userData[field];
          const empty =
            val === null || val === undefined || String(val).trim() === '';
          if (empty) missing.push(`${labelMap[field]} is required.`);
        }

        // Validate ID Number (alphanumeric, at least 4 characters)
        if (userData.idNumber) {
          const idNumber = userData.idNumber.trim();
          if (idNumber.length < 4) {
            missing.push('ID number must be at least 4 characters long.');
          }
          if (!/^[a-zA-Z0-9-]+$/.test(idNumber)) {
            missing.push(
              'ID number can only contain letters, numbers, and hyphens.'
            );
          }
        }

        // Validate First Name (letters only, at least 2 characters)
        if (userData.firstName) {
          const firstName = userData.firstName.trim();
          if (firstName.length < 2) {
            missing.push('First name must be at least 2 characters long.');
          }
          if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
            missing.push(
              'First name can only contain letters, spaces, hyphens, and apostrophes.'
            );
          }
        }

        // Validate Last Name (letters only, at least 2 characters)
        if (userData.lastName) {
          const lastName = userData.lastName.trim();
          if (lastName.length < 2) {
            missing.push('Last name must be at least 2 characters long.');
          }
          if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
            missing.push(
              'Last name can only contain letters, spaces, hyphens, and apostrophes.'
            );
          }
        }

        // Validate Middle Name (letters only if provided)
        if (userData.middleName && userData.middleName.trim()) {
          const middleName = userData.middleName.trim();
          if (!/^[a-zA-Z\s'-]+$/.test(middleName)) {
            missing.push(
              'Middle name can only contain letters, spaces, hyphens, and apostrophes.'
            );
          }
        }

        // Validate Sex
        if (userData.sex) {
          const sex = userData.sex.trim().toUpperCase();
          if (!['M', 'F', 'MALE', 'FEMALE'].includes(sex)) {
            missing.push('Sex must be Male (M) or Female (F).');
          }
        }

        // Validate Date of Birth (minimum age 18 years)
        if (userData.dateOfBirth) {
          const dob = new Date(userData.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          const dayDiff = today.getDate() - dob.getDate();

          // Check if date is valid
          if (isNaN(dob.getTime())) {
            missing.push('Date of birth is not a valid date.');
          } else {
            // Check if date is not in the future
            if (dob > today) {
              missing.push('Date of birth cannot be in the future.');
            }

            // Calculate exact age
            const exactAge =
              age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);

            if (exactAge < 18) {
              missing.push('You must be at least 18 years old to verify.');
            }

            // Check if age is reasonable (not older than 120 years)
            if (exactAge > 120) {
              missing.push('Date of birth seems invalid (age over 120 years).');
            }
          }
        }

        // Validate Issue Date
        if (userData.issueDate) {
          const issueDate = new Date(userData.issueDate);
          const today = new Date();

          if (isNaN(issueDate.getTime())) {
            missing.push('Issue date is not a valid date.');
          } else {
            if (issueDate > today) {
              missing.push('Issue date cannot be in the future.');
            }

            // Issue date should be after date of birth
            if (userData.dateOfBirth) {
              const dob = new Date(userData.dateOfBirth);
              if (!isNaN(dob.getTime()) && issueDate < dob) {
                missing.push('Issue date cannot be before date of birth.');
              }
            }
          }
        }

        // Validate Expiry Date (required unless UMID)
        if (selectedIDType?.type !== 'umid') {
          if (userData.expiryDate) {
            const expiryDate = new Date(userData.expiryDate);
            const today = new Date();

            if (isNaN(expiryDate.getTime())) {
              missing.push('Expiry date is not a valid date.');
            } else {
              // Expiry date should be in the future
              if (expiryDate < today) {
                missing.push(
                  'ID has expired. Please use a valid, non-expired ID.'
                );
              }

              // Expiry date should be after issue date
              if (userData.issueDate) {
                const issueDate = new Date(userData.issueDate);
                if (!isNaN(issueDate.getTime()) && expiryDate <= issueDate) {
                  missing.push('Expiry date must be after issue date.');
                }
              }
            }
          } else {
            missing.push('Expiry date is required.');
          }
        }

        // Validate Address (minimum length)
        if (userData.address) {
          const address = userData.address.trim();
          if (address.length < 10) {
            missing.push('Address must be at least 10 characters long.');
          }
          if (address.length > 500) {
            missing.push('Address is too long (maximum 500 characters).');
          }
        }
      }
    }

    return missing;
  }, [selectedIDType?.type, selectedIDType?.file, userData]);

  const handleDisableNext = useCallback((): boolean => {
    if (isUploading) return true;
    return missingRequirements.length > 0;
  }, [isUploading, missingRequirements]);

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
                {missingRequirements.map((item, idx) => (
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
          isLoading={isUploading}
        />
      </CardContent>
    </Card>
  );
}
