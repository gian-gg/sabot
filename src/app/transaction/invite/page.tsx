'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReviewInvitationStep from '@/components/transaction/invite/review-invitation';
import UploadScreenshotStep from '@/components/transaction/invite/upload-screenshot';
import VerificationStep from '@/components/transaction/invite/user-verification';

type Step = 'review' | 'upload' | 'verification';

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('review');
  const [file, setFile] = useState<File | null>(null);

  const inviterEmail = searchParams.get('from') || 'user@example.com';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAcceptInvite = () => setStep('upload');

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setStep('verification');

    // Simulate verification completing
    setTimeout(() => {
      // Redirect to transaction page
      const mockTransactionId = 'TX-2024-001242';
      router.push(ROUTES.TRANSACTION.VIEW(mockTransactionId));
    }, 3000);

    // Simulate verification and redirect after a delay if needed
  };

  return (
    <div className="flex min-h-screen w-full flex-col pt-14">
      <div className="flex flex-1 items-center justify-center overflow-y-auto">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl">
                  Transaction Invitation
                </CardTitle>
                <CardDescription>
                  You&apos;ve been invited to a verified transaction
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="border-blue-500/30 bg-blue-500/10 text-blue-400"
              >
                Step {step === 'review' ? '1' : step === 'upload' ? '2' : '3'}/3
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {step === 'review' && (
              <ReviewInvitationStep
                inviterEmail={inviterEmail}
                onDecline={() => router.push(ROUTES.HOME.ROOT)}
                onAccept={handleAcceptInvite}
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
    </div>
  );
}
