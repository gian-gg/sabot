'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input'; // Removed unused import
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileText,
  Image,
  Video,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadProofDialogProps {
  deliverableId: string;
  deliverableTitle: string;
  deliverableType: 'product' | 'service' | 'payment' | 'document';
  onProofSubmitted: () => void;
  children: React.ReactNode;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  preview?: string;
  file: File; // Store the actual File object
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = {
  product: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/webm',
  ],
  service: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/webm',
    'application/pdf',
    'text/plain',
  ],
  payment: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
  ],
  document: [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

export function UploadProofDialog({
  deliverableId,
  deliverableTitle,
  deliverableType,
  onProofSubmitted,
  children,
}: UploadProofDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<
    'pending' | 'verifying' | 'verified' | 'failed'
  >('pending');
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    confidence: number;
    reason: string;
    details: Record<string, unknown>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // Validate file type based on deliverable type
      const allowedTypes =
        ALLOWED_TYPES[deliverableType] || Object.values(ALLOWED_TYPES).flat();
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `File type ${file.type} is not allowed for ${deliverableType} deliverables.`
        );
        continue;
      }

      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        preview,
        file: file, // Store the actual File object
      };

      setUploadedFiles((prev) => [...prev, uploadedFile]);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file?.url) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please select at least one file to upload.');
      return;
    }

    // Validate files before upload
    for (const uploadedFile of uploadedFiles) {
      if (!uploadedFile.file) {
        toast.error(
          `File ${uploadedFile.name} is missing. Please reselect files.`
        );
        return;
      }

      if (uploadedFile.file.size > MAX_FILE_SIZE) {
        toast.error(
          `File ${uploadedFile.name} is too large. Maximum size is 10MB.`
        );
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // Add files to form data - use the state files
      uploadedFiles.forEach((file, index) => {
        if (file.file) {
          formData.append(`file_${index}`, file.file);
        }
      });

      // Add metadata
      formData.append('deliverable_id', deliverableId);
      formData.append('description', description);
      formData.append('deliverable_type', deliverableType);

      const response = await fetch('/api/escrow/upload-proof', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.error ||
            errorData.message ||
            `HTTP ${response.status}: Upload failed`;
        } catch {
          errorMessage = `HTTP ${response.status}: Upload failed`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Start AI verification
      setVerificationStatus('verifying');
      await verifyWithAI(result.proof_id);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const verifyWithAI = async (proofId: string) => {
    try {
      const response = await fetch('/api/ai/verify-deliverable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proof_id: proofId,
          deliverable_id: deliverableId,
          deliverable_type: deliverableType,
        }),
      });

      if (!response.ok) {
        throw new Error('AI verification failed');
      }

      const result = await response.json();
      setVerificationResult(result);
      setVerificationStatus(result.verified ? 'verified' : 'failed');

      if (result.verified) {
        toast.success('Deliverable verified successfully!');
        onProofSubmitted();
        setOpen(false);
      } else {
        toast.error(`Verification failed: ${result.reason || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('AI verification error:', error);
      setVerificationStatus('failed');
      toast.error('AI verification failed. Please try again.');
    }
  };

  const getVerificationStatusColor = () => {
    switch (verificationStatus) {
      case 'verified':
        return 'text-green-400 bg-green-900/20 border-green-500/30';
      case 'failed':
        return 'text-red-400 bg-red-900/20 border-red-500/30';
      case 'verifying':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30';
      default:
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    }
  };

  const getVerificationIcon = () => {
    switch (verificationStatus) {
      case 'verified':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      case 'verifying':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Proof for {deliverableTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Deliverable Info */}
          <Card className="border-blue-500/30 bg-blue-900/20">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-blue-500/30 text-blue-300"
                >
                  {deliverableType}
                </Badge>
                <span className="text-sm text-blue-300">Deliverable</span>
              </div>
              <p className="font-medium text-white">{deliverableTitle}</p>
              <p className="mt-1 text-sm text-blue-300/70">
                Upload proof files to verify completion of this deliverable.
              </p>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="space-y-4">
            <Label htmlFor="file-upload" className="font-medium text-white">
              Upload Files
            </Label>
            <div className="rounded-lg border-2 border-dashed border-neutral-600 p-6 text-center">
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept={ALLOWED_TYPES[deliverableType]?.join(',')}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mb-4"
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Files
              </Button>
              <p className="text-sm text-neutral-400">
                Maximum file size: 10MB. Allowed types:{' '}
                {ALLOWED_TYPES[deliverableType]?.join(', ')}
              </p>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="font-medium text-white">Selected Files</Label>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg bg-neutral-800 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.preview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium text-white">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the proof you're uploading..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-neutral-600 bg-neutral-800 text-white"
              rows={3}
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white">Uploading...</span>
                <span className="text-neutral-400">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Verification Status */}
          {verificationStatus !== 'pending' && (
            <Card className={`border ${getVerificationStatusColor()}`}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  {getVerificationIcon()}
                  <span className="font-medium">
                    {verificationStatus === 'verifying' &&
                      'Verifying with AI...'}
                    {verificationStatus === 'verified' &&
                      'Verified Successfully'}
                    {verificationStatus === 'failed' && 'Verification Failed'}
                  </span>
                </div>
                {verificationResult && (
                  <div className="text-sm">
                    <p className="mb-2 text-neutral-300">
                      Confidence Score:{' '}
                      {(verificationResult.confidence * 100).toFixed(1)}%
                    </p>
                    {verificationResult.reason && (
                      <p className="text-neutral-400">
                        {verificationResult.reason}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={uploadFiles}
              disabled={uploading || uploadedFiles.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Verify
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
