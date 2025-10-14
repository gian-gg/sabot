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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Upload,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

type Step = 'review' | 'upload' | 'verification';

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('review');
  const [file, setFile] = useState<File | null>(null);

  // In real app, decode the base64 transaction data from query params
  const inviterEmail = searchParams.get('from') || 'user@example.com';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAcceptInvite = () => {
    setStep('upload');
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Simulate upload and verification
    setStep('verification');

    // Simulate verification completing
    setTimeout(() => {
      // Redirect to transaction page
      const mockTransactionId = 'TX-2024-001242';
      router.push(ROUTES.TRANSACTION.VIEW(mockTransactionId));
    }, 3000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1 items-center justify-center overflow-y-auto">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  Transaction Invitation
                </CardTitle>
                <CardDescription className="text-neutral-400">
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
            {/* Step 1: Review Invitation */}
            {step === 'review' && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                  <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                  <div>
                    <p className="mb-1 text-sm font-medium text-blue-300">
                      Invitation from {inviterEmail}
                    </p>
                    <p className="text-xs text-blue-400/70">
                      They have uploaded their conversation screenshot and are
                      waiting for you to verify the transaction
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-white">
                    What happens next?
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-400">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Upload your conversation screenshot
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          This will be cross-referenced with the other
                          party&apos;s upload
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs font-semibold text-purple-400">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          AI verifies authenticity
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          Our system detects inconsistencies and fraud attempts
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500/20 text-xs font-semibold text-green-400">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Review transaction summary
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                          Proceed with a safe, verified transaction
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-neutral-700 text-neutral-300 hover:bg-white/5"
                    onClick={() => router.push(ROUTES.HOME.ROOT)}
                  >
                    Decline
                  </Button>
                  <Button
                    className="flex-1 bg-white text-black hover:bg-neutral-200"
                    onClick={handleAcceptInvite}
                  >
                    Accept & Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Upload Screenshot */}
            {step === 'upload' && (
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="screenshot" className="text-neutral-200">
                    Your Conversation Screenshot
                  </Label>
                  <div className="rounded-lg border-2 border-dashed border-neutral-700 p-8 text-center transition-colors hover:border-neutral-600">
                    <input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="screenshot" className="cursor-pointer">
                      <Upload className="mx-auto mb-3 h-12 w-12 text-neutral-500" />
                      {file ? (
                        <div>
                          <p className="text-sm font-medium text-white">
                            {file.name}
                          </p>
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

                <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                  <p className="text-xs text-blue-300">
                    Your screenshot is encrypted and only used for verification.
                    It will not be shared with anyone.
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
            )}

            {/* Step 3: Verification */}
            {step === 'verification' && (
              <div className="space-y-6 py-12 text-center">
                <div className="relative inline-block">
                  <Sparkles className="h-16 w-16 animate-pulse text-purple-400" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Verifying Transaction
                  </h3>
                  <p className="text-sm text-neutral-400">
                    AI is cross-referencing both screenshots...
                  </p>
                </div>
                <div className="mx-auto max-w-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Screenshots uploaded successfully</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Detecting message authenticity</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span>Cross-referencing conversation data</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                    <span>Generating transaction summary</span>
                  </div>
                </div>

                <div className="mx-auto flex max-w-md items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                  <p className="text-xs text-green-300">
                    No inconsistencies detected. Preparing your transaction...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
