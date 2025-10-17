'use client';

import { useState } from 'react';
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

  const handleAcceptInvite = () => {
    setStep('upload');
  };

  const handleDecline = () => {
    router.push(ROUTES.HOME.ROOT);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStep('verification');

    // Simulate verification process
    setTimeout(() => {
      // After verification, navigate to transaction details
      router.push(`/transaction/${transactionId}`);
    }, 3000);
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
