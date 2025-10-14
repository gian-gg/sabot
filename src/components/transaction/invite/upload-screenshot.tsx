import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Upload } from 'lucide-react';

export default function UploadScreenshotStep({
  file,
  onFileChange,
  onUpload,
}: {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onUpload} className="space-y-6">
      <div className="space-y-4">
        <Label htmlFor="screenshot" className="text-neutral-200">
          Conversation Screenshot
        </Label>
        <div className="rounded-lg border-2 border-dashed border-neutral-700 p-8 text-center transition-colors hover:border-neutral-600">
          <input
            id="screenshot"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
          <label htmlFor="screenshot" className="cursor-pointer">
            <Upload className="mx-auto mb-3 h-12 w-12 text-neutral-500" />
            {file ? (
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="mt-1 text-xs text-neutral-400">
                  Click to change file
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-white">
                  Upload your conversation screenshot
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  PNG, JPG up to 10MB
                </p>
              </div>
            )}
          </label>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
        <ShieldCheck className="mb-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
        <p className="text-xs text-blue-300">
          Your screenshot is encrypted and only used for verification. It will
          not be shared with anyone.
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1 bg-white text-black hover:bg-neutral-200"
          disabled={!file}
        >
          Upload & Verify
        </Button>
      </div>
    </form>
  );
}
