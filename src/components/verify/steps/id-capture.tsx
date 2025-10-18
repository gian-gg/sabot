import { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { maxSizeUploadIDDocument } from '@/constants/upload';
import NavigationButtons from '../components/navigation-buttons';
import PreviewForm from '../components/upload-id/preview-form';

import { extractID } from '@/lib/gemini/verify';

import type { GovernmentIdInfo, StepNavProps } from '@/types/verify';
import Upload from '../components/upload-id/upload';
import PreviewUpload from '../components/upload-id/preview-upload';

export function IdCapture({ onNext, onPrev }: StepNavProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<GovernmentIdInfo | null>(null);
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
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setFile(f);

    const data = await extractID(f);

    if (data.notes) {
      console.warn('⚠️ Quality Warning:', data.notes);
    }

    setExtracted(data as GovernmentIdInfo);
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
        {!file ? (
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
            file={file}
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
        {form && <PreviewForm extractedData={extracted} setForm={setForm} />}

        <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-1 text-sm">
          <li>Avoid glare and shadows.</li>
          <li>Use a well-lit area.</li>
          <li>Ensure all text is readable.</li>
        </ul>

        {/* Navigation buttons */}
        <NavigationButtons
          onNext={onNext}
          onPrev={onPrev}
          isUploading={isUploading}
        />
      </CardContent>
    </Card>
  );
}
