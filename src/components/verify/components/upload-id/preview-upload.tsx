import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, FileText, UploadCloud } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import Image from 'next/image';

interface PreviewUploadProps {
  file: File;
  isUploading?: boolean;
  openFileDialog: () => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}

const PreviewUpload: React.FC<PreviewUploadProps> = ({
  file,
  isUploading = false,
  openFileDialog,
  onKeyDown = () => {},
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    // Create a blob URL for images and revoke it when the file changes or
    // the component unmounts to avoid memory leaks and performance issues.
    if (!file) {
      setObjectUrl(null);
      return;
    }

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        // Revoke previously created URL
        URL.revokeObjectURL(url);
        setObjectUrl(null);
      };
    }

    // Non-image files should not have an object URL
    setObjectUrl(null);
    return;
  }, [file]);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openFileDialog}
      onKeyDown={onKeyDown}
      className={cn(
        'group focus-visible:ring-primary relative mb-6 rounded-md border p-4 transition-shadow outline-none hover:shadow-sm focus-visible:ring-2',
        isUploading && 'animate-pulse'
      )}
      aria-label="Uploaded file. Click to replace."
      aria-disabled={isUploading}
      aria-busy={isUploading}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          {isUploading ? (
            <>Processing…</>
          ) : (
            <>
              <CheckCircle2 className="size-4 text-green-600" /> Uploaded
              successfully
            </>
          )}
        </div>
        {!isUploading && (
          <span className="text-muted-foreground text-xs">
            Click to replace
          </span>
        )}
      </div>

      {file.type.startsWith('image/') ? (
        <div className="relative mx-auto h-64 w-full max-w-md">
          {objectUrl ? (
            <Image
              src={objectUrl}
              alt="Uploaded ID preview"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 512px"
              className="rounded-md object-contain"
            />
          ) : (
            // Fallback while URL is being created (very fast) to avoid
            // passing an empty src to next/image
            <div className="bg-muted flex h-64 w-full items-center justify-center rounded-md">
              <span className="text-muted-foreground text-sm">
                Preparing preview…
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-all duration-200 group-hover:opacity-100">
            <div className="flex items-center gap-2 text-xs font-medium text-white md:text-sm">
              <UploadCloud className="size-4 md:size-5" />
              <span>Click to replace</span>
            </div>
          </div>
          {isUploading && (
            <div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center rounded-md">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Spinner className="text-primary size-4" /> Processing…
              </div>
            </div>
          )}
        </div>
      ) : file ? (
        <div className="relative flex items-center justify-center">
          {!isUploading && (
            <>
              <span className="text-primary flex items-center gap-2 text-sm underline">
                <FileText className="size-4" /> View uploaded PDF
              </span>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-all duration-200 group-hover:opacity-100">
                <div className="flex items-center gap-2 text-xs font-medium text-white md:text-sm">
                  <UploadCloud className="size-4 md:size-5" />
                  <span>Click to replace</span>
                </div>
              </div>
            </>
          )}
          {isUploading && (
            <div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center rounded-md">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Spinner className="text-primary size-4" /> Processing…
              </div>
            </div>
          )}
        </div>
      ) : null}
      <p className="text-muted-foreground mt-3 text-xs">
        File: {file.name} ({Math.round(file.size / 1024)} KB)
      </p>
    </div>
  );
};

export default PreviewUpload;
