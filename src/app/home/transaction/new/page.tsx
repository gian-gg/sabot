'use client';

import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/common/page-header';
import { Upload, Users, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Step = 'upload' | 'waiting' | 'analysis' | 'summary';

export default function NewTransactionPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [counterpartyEmail, setCounterpartyEmail] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !counterpartyEmail) return;

    // Simulate upload and move to waiting step
    setStep('waiting');

    // Simulate counterparty upload after 3 seconds
    setTimeout(() => {
      setStep('analysis');

      // Simulate AI analysis after 2 seconds
      setTimeout(() => {
        setStep('summary');
      }, 2000);
    }, 3000);
  };

  const handleCreateTransaction = () => {
    // In real app, this would create the transaction in database
    const mockTransactionId = 'TX-2024-001242';
    router.push(ROUTES.TRANSACTION.VIEW(mockTransactionId));
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      <PageHeader backButtonFallback={ROUTES.HOME.ROOT} />

      <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
        <Card className="w-full max-w-2xl border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Create Transaction</CardTitle>
                <CardDescription className="text-neutral-400">
                  Start a verified transaction with AI-powered safety
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="border-blue-500/30 bg-blue-500/10 text-blue-400"
              >
                Step{' '}
                {step === 'upload'
                  ? '1'
                  : step === 'waiting'
                    ? '2'
                    : step === 'analysis'
                      ? '3'
                      : '4'}
                /4
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Step 1: Upload Screenshot */}
            {step === 'upload' && (
              <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="counterparty" className="text-neutral-200">
                    Counterparty Email
                  </Label>
                  <Input
                    id="counterparty"
                    type="email"
                    value={counterpartyEmail}
                    onChange={(e) => setCounterpartyEmail(e.target.value)}
                    required
                    className="border-neutral-700 bg-black/40 text-white"
                    placeholder="their.email@example.com"
                  />
                  <p className="text-xs text-neutral-500">
                    They&apos;ll receive an invitation to join this transaction
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot" className="text-neutral-200">
                    Conversation Screenshot
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
                            Upload screenshot of your conversation
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
                  <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                  <p className="text-xs text-blue-300">
                    Our AI will analyze both screenshots to detect fraud, verify
                    consistency, and generate a transaction summary.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-neutral-200"
                  disabled={!file || !counterpartyEmail}
                >
                  Send Invitation & Upload
                </Button>
              </form>
            )}

            {/* Step 2: Waiting for Counterparty */}
            {step === 'waiting' && (
              <div className="space-y-6 py-12 text-center">
                <div className="relative inline-block">
                  <Users className="h-16 w-16 animate-pulse text-blue-400" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    Waiting for Counterparty
                  </h3>
                  <p className="text-sm text-neutral-400">
                    We&apos;ve sent an invitation to{' '}
                    <span className="text-white">{counterpartyEmail}</span>
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    They need to upload their conversation screenshot before we
                    can proceed
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                    style={{ animationDelay: '0s' }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <div
                    className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            )}

            {/* Step 3: AI Analysis */}
            {step === 'analysis' && (
              <div className="space-y-6 py-12 text-center">
                <div className="relative inline-block">
                  <Sparkles className="h-16 w-16 text-purple-400" />
                  <Loader2 className="absolute -top-2 -right-2 h-6 w-6 animate-spin text-purple-400" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    AI Analysis in Progress
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Cross-referencing screenshots and detecting
                    inconsistencies...
                  </p>
                </div>
                <div className="mx-auto max-w-sm space-y-2">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    <span>Verifying message authenticity</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    <span>Detecting platform type</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
                    <span>Generating transaction summary</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Summary Review */}
            {step === 'summary' && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-300">
                      Analysis Complete - No Issues Detected
                    </p>
                    <p className="mt-1 text-xs text-green-400/70">
                      Both screenshots match perfectly with no inconsistencies
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-white">
                    Transaction Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-4 rounded-lg border border-neutral-800/50 bg-black/40 p-4">
                    <div>
                      <p className="mb-1 text-xs text-neutral-500">Item</p>
                      <p className="text-sm text-white">
                        iPhone 14 Pro Max 256GB
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-neutral-500">Price</p>
                      <p className="text-sm text-white">₱45,000</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-neutral-500">Platform</p>
                      <p className="text-sm text-white">Facebook Marketplace</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-neutral-500">Meetup</p>
                      <p className="text-sm text-white">SM Mall of Asia</p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                    <p className="text-xs text-blue-300">
                      <strong>Market Insight:</strong> Average price for similar
                      listings: ₱48,000. Current offer is 6% below market
                      average - within safe range.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-neutral-700 text-neutral-300 hover:bg-white/5"
                    onClick={() => router.push(ROUTES.HOME.ROOT)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-white text-black hover:bg-neutral-200"
                    onClick={handleCreateTransaction}
                  >
                    Create Transaction
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
