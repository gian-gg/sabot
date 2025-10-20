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
import { Badge } from '@/components/ui/badge';
import { ReviewTransactionInvitation } from '@/components/transaction/invite/review-invitation';
import { UploadScreenshotStep } from '@/components/transaction/invite/upload-screenshot';
import { VerificationStep } from '@/components/transaction/invite/verification-step';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { toast } from 'sonner';

type Step = 'review' | 'upload' | 'verification';

interface AcceptTransactionPageProps {
  transactionId: string;
}

// Mock inviter data - replace with actual data fetching
const mockInviter = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: undefined,
  trustScore: 92,
  isVerified: true,
  completedTransactions: 15,
};

export function AcceptTransactionPage({
  transactionId,
}: AcceptTransactionPageProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('review');
  const [file, setFile] = useState<File | null>(null);
  const [joining, setJoining] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { status } = useTransactionStatus(transactionId);

  // Automatically move to upload step when both joined
  useEffect(() => {
    if (status?.transaction.status === 'both_joined' && step === 'review') {
      setStep('upload');
    }
  }, [status, step]);

  // Navigate when both screenshots uploaded
  useEffect(() => {
    if (
      status?.is_ready_for_next_step &&
      status.transaction.status === 'screenshots_uploaded'
    ) {
      toast.success('Both screenshots uploaded! Proceeding...');
      setTimeout(() => {
        router.push(ROUTES.TRANSACTION.VIEW(transactionId));
      }, 1500);
    }
  }, [status, transactionId, router]);

  const handleAcceptInvite = async () => {
    setJoining(true);
    try {
      const response = await fetch('/api/transaction/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to join transaction');
      }

      toast.success('Successfully joined transaction!');
      setStep('upload');
    } catch (error) {
      console.error('Error joining transaction:', error);
      toast.error('Failed to join transaction');
    } finally {
      setJoining(false);
    }
  };

  const handleDecline = () => {
    router.push(ROUTES.HOME.ROOT);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setStep('verification');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/transaction/${transactionId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload screenshot');
      }

      const data = await response.json();
      toast.success('Screenshot uploaded successfully!');

      if (data.both_uploaded) {
        toast.success('Both parties have uploaded! Processing...');
        setTimeout(() => {
          router.push(ROUTES.TRANSACTION.VIEW(transactionId));
        }, 2000);
      }
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      toast.error('Failed to upload screenshot');
      setStep('upload');
    } finally {
      setUploading(false);
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'review':
        return 1;
      case 'upload':
        return 2;
      case 'verification':
        return 3;
      default:
        return 1;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">Transaction Invitation</CardTitle>
              <CardDescription>
                {step === 'review' &&
                  "You've been invited to a verified transaction"}
                {step === 'upload' && 'Upload your conversation screenshot'}
                {step === 'verification' && 'Verifying transaction details'}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary"
            >
              Step {getStepNumber()}/3
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'review' && (
            <ReviewTransactionInvitation
              inviter={mockInviter}
              onAccept={handleAcceptInvite}
              onDecline={handleDecline}
            />
          )}

          {step === 'upload' && (
            <UploadScreenshotStep
              file={file}
              onFileChange={handleFileChange}
              onUpload={handleUpload}
            />
          )}

          {step === 'verification' && <VerificationStep />}
        </CardContent>
      </Card>
    </div>
  );
}
