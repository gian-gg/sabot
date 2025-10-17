'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Upload } from 'lucide-react';

interface UploadScreenshotStepProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: (e: React.FormEvent) => void;
}

export function UploadScreenshotStep({
  file,
  onFileChange,
  onUpload,
}: UploadScreenshotStepProps) {
  return (
    <Card>
      <CardContent>
        <form onSubmit={onUpload} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="screenshot">Conversation Screenshot</Label>
            <div className="hover:border-primary/50 border-border rounded-lg border-2 border-dashed p-8 text-center transition-colors">
              <input
                id="screenshot"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
              <label htmlFor="screenshot" className="cursor-pointer">
                <Upload className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                {file ? (
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">
                      Upload your conversation screenshot
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="border-primary/30 bg-primary/10 flex items-center gap-2 rounded-lg border p-3">
            <ShieldCheck className="text-primary h-4 w-4 flex-shrink-0" />
            <p className="text-primary text-xs">
              Your screenshot is encrypted and only used for verification. It
              will not be shared with anyone.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={!file}>
            Upload & Verify
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
