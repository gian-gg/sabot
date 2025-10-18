import React from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

type UploadProps = {
  openFileDialog?: () => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onDrop?: React.DragEventHandler<HTMLDivElement>;
  onDragOver?: React.DragEventHandler<HTMLDivElement>;
  onDragLeave?: React.DragEventHandler<HTMLDivElement>;
  isDragging?: boolean;
  isUploading?: boolean;
  className?: string;
};

const Upload: React.FC<UploadProps> = ({
  openFileDialog,
  onKeyDown,
  onDrop,
  onDragOver,
  onDragLeave,
  isDragging = false,
  isUploading = false,
  className,
}) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openFileDialog}
      onKeyDown={onKeyDown}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      className={cn(
        'focus-visible:ring-primary relative mb-4 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors outline-none focus-visible:ring-2',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/20 hover:border-primary',
        className
      )}
      aria-disabled={isUploading}
      aria-busy={isUploading}
    >
      {isUploading && (
        <div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Spinner className="text-primary size-4" /> Processing…
          </div>
        </div>
      )}
      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        Click to upload or drag and drop
      </p>
      <p className="text-xs text-gray-500">
        PNG, JPG, or PDF — only 1 file, up to 10MB
      </p>
    </div>
  );
};

export default Upload;
