import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, FileText, UploadCloud } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import Image from 'next/image';

interface PreviewUploadProps {
  file: File;
  previewUrl?: string | null;
  isUploading?: boolean;
  openFileDialog: () => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}

const PreviewUpload: React.FC<PreviewUploadProps> = ({
  file,
  previewUrl,
  isUploading = false,
  openFileDialog,
  onKeyDown = () => {},
}) => {
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

      {file.type.startsWith('image/') && previewUrl ? (
        <div className="relative mx-auto h-64 w-full max-w-md">
          <Image
            src={previewUrl}
            alt="Uploaded ID preview"
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 512px"
            className="rounded-md object-contain"
          />
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
      ) : previewUrl ? (
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
