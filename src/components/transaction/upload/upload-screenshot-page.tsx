'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Upload } from 'lucide-react';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { toast } from 'sonner';

interface UploadScreenshotPageProps {
  transactionId: string;
}

export function UploadScreenshotPage({
  transactionId,
}: UploadScreenshotPageProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { status } = useTransactionStatus(transactionId);

  // Navigate to transaction page when both screenshots uploaded
  useEffect(() => {
    if (
      status?.is_ready_for_next_step &&
      status.transaction.status === 'screenshots_uploaded'
    ) {
      console.log('Both uploaded! Navigating to transaction page...');
      toast.success('Both screenshots uploaded! Proceeding...');
      setTimeout(() => {
        router.push(ROUTES.TRANSACTION.VIEW(transactionId));
      }, 1500);
    }
  }, [status, transactionId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/transaction/${transactionId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to upload screenshot');
      }

      toast.success('Screenshot uploaded successfully!');
      // Wait for status update via real-time hook
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload screenshot'
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">
            Upload Conversation Screenshot
          </CardTitle>
          <CardDescription>
            Upload a screenshot of your conversation with the other party for
            verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="screenshot">Conversation Screenshot</Label>
              <div className="hover:border-primary/50 border-border rounded-lg border-2 border-dashed p-8 text-center transition-colors">
                <input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
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
                        PNG, JPG, WebP up to 10MB
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

            <Button
              type="submit"
              className="w-full"
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload & Verify'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
