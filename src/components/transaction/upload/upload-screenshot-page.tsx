'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { ShieldCheck, Upload, Loader2, CheckCircle2 } from 'lucide-react';
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentUserUploaded, setCurrentUserUploaded] = useState(false);
  const analysisTriggeredRef = useRef(false);

  const { status } = useTransactionStatus(transactionId);

  const triggerAnalysis = useCallback(async () => {
    if (analysisTriggeredRef.current) {
      console.log('⏭️ Analysis already triggered, skipping...');
      return;
    }

    analysisTriggeredRef.current = true;

    try {
      console.log('🚀 Triggering analysis for transaction:', transactionId);

      const response = await fetch(
        `/api/transaction/${transactionId}/analyze-screenshots`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();
      console.log('📊 Analysis response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze screenshots');
      }

      console.log('✅ Analysis triggered successfully');
      toast.success('Analysis completed!');
    } catch (error) {
      console.error('❌ Error triggering analysis:', error);
      toast.error('Failed to analyze screenshots. Please try again.');
      setAnalyzing(false);
      analysisTriggeredRef.current = false;
    }
  }, [transactionId]);

  // Trigger analysis when both screenshots uploaded
  useEffect(() => {
    const bothUploaded =
      status?.is_ready_for_next_step &&
      status.transaction.status === 'screenshots_uploaded';

    if (bothUploaded && !analyzing && !analysisTriggeredRef.current) {
      console.log('✅ Both uploaded! Starting analysis...');
      toast.success('Both screenshots uploaded! Analyzing...');
      setAnalyzing(true);
      triggerAnalysis();
    }
  }, [
    status?.is_ready_for_next_step,
    status?.transaction.status,
    analyzing,
    triggerAnalysis,
  ]);

  // Navigate when analysis is complete (status becomes 'active')
  useEffect(() => {
    if (status?.transaction.status === 'active' && analyzing) {
      console.log('✅ Analysis complete! Navigating to transaction page...');
      toast.success('Analysis complete! Proceeding...');
      setTimeout(() => {
        router.push(ROUTES.TRANSACTION.VIEW(transactionId));
      }, 1500);
    }
  }, [status?.transaction.status, transactionId, router, analyzing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || uploading) return; // Prevent multiple clicks

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    // Track upload progress (0-90% for file upload to server)
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        // Map to 0-90% to leave room for server processing
        const percentComplete = Math.round((event.loaded / event.total) * 90);
        setUploadProgress(percentComplete);
      }
    });

    // Handle upload completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          // Set to 100% to indicate completion
          setUploadProgress(100);

          // Show success after a brief delay so user sees 100%
          setTimeout(() => {
            toast.success('Screenshot uploaded successfully!');
            setCurrentUserUploaded(true);
            setUploadProgress(0);
            setUploading(false);
            // Wait for status update via real-time hook
          }, 300);
        } catch (error) {
          console.error('Error parsing response:', error);
          toast.error('Failed to parse upload response');
          setUploading(false);
          setUploadProgress(0);
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          console.error('Upload error:', errorData);
          toast.error(errorData.error || 'Upload failed');
          setUploading(false);
          setUploadProgress(0);
        } catch (error) {
          console.error('Upload error:', error);
          toast.error('Failed to upload screenshot');
          setUploading(false);
          setUploadProgress(0);
        }
      }
    });

    // Handle upload errors
    xhr.addEventListener('error', () => {
      console.error('Upload error');
      toast.error('Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    });

    // Handle upload abort
    xhr.addEventListener('abort', () => {
      console.log('Upload aborted');
      setUploading(false);
      setUploadProgress(0);
    });

    // Send the request
    xhr.open('POST', `/api/transaction/${transactionId}/upload`);
    xhr.send(formData);
  };

  // Show analyzing state
  if (analyzing || status?.transaction.status === 'active') {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="text-primary mb-4 h-16 w-16 animate-spin" />
            <h3 className="mb-2 text-xl font-semibold">
              {status?.transaction.status === 'active'
                ? 'Analysis Complete!'
                : 'Analyzing Screenshots...'}
            </h3>
            <p className="text-muted-foreground w-xl text-center">
              {status?.transaction.status === 'active'
                ? 'Redirecting you to the transaction page...'
                : 'Our AI is extracting transaction details from your conversation screenshots. This may take a moment...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show waiting state if current user uploaded but partner hasn't
  if (currentUserUploaded && !status?.is_ready_for_next_step) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="text-primary mb-4 h-16 w-16" />
            <h3 className="mb-2 text-xl font-semibold">
              Screenshot Uploaded Successfully!
            </h3>
            <p className="text-muted-foreground mb-6 text-center">
              Waiting for the other party to upload their screenshot...
            </p>
            <div className="flex items-center gap-2">
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
              <span className="text-muted-foreground text-sm">
                We&apos;ll automatically start analyzing once both screenshots
                are uploaded
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                  <span className="text-muted-foreground text-sm font-medium">
                    {uploadProgress}%
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!file || uploading || currentUserUploaded}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : currentUserUploaded ? (
                'Uploaded'
              ) : (
                'Upload & Verify'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
