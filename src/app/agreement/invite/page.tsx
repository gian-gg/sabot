'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import ReviewInvitation from '@/components/agreement/invite/review-invitation';
import SelectTemplate from '@/components/agreement/invite/select-template';
import { agreementTemplates } from '@/lib/mock-data/agreements';
// TODO: Import VerificationStep from transaction components when ready
// TODO: Import Card, Badge components from shadcn/ui

type Step = 'review' | 'template' | 'verification';

export default function InviteAgreementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('review');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const inviterEmail = searchParams.get('from') || 'john@example.com';
  const agreementType = searchParams.get('type') || 'Partnership Agreement';

  const handleAcceptInvite = () => setStep('template');
  const handleDeclineInvite = () => router.push(ROUTES.HOME.ROOT);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinueFromTemplate = () => {
    if (!selectedTemplate) return;
    setStep('verification');

    // Mock verification completing
    setTimeout(() => {
      // Redirect to agreement view page
      const mockAgreementId = 'AGR-2025-001';
      router.push(ROUTES.AGREEMENT.VIEW(mockAgreementId));
    }, 3000);
  };

  return (
    <div className="flex min-h-screen w-full flex-col pt-14">
      <div className="flex flex-1 items-center justify-center overflow-y-auto">
        {/* TODO: Replace with v0-generated Card UI */}
        <div className="w-full max-w-2xl">
          <div>
            <h1>Agreement Invitation</h1>
            <p>You&apos;ve been invited to create a collaborative agreement</p>
            <span>
              Step {step === 'review' ? '1' : step === 'template' ? '2' : '3'}
              /3
            </span>
          </div>

          <div>
            {step === 'review' && (
              <ReviewInvitation
                inviterEmail={inviterEmail}
                agreementType={agreementType}
                onAccept={handleAcceptInvite}
                onDecline={handleDeclineInvite}
              />
            )}

            {step === 'template' && (
              <SelectTemplate
                templates={agreementTemplates}
                selectedTemplate={selectedTemplate}
                onSelect={handleSelectTemplate}
                onContinue={handleContinueFromTemplate}
              />
            )}

            {step === 'verification' && (
              <div>
                {/* TODO: Replace with actual VerificationStep component */}
                <p>Verifying your identity...</p>
                <p>Please wait while we verify your account.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
