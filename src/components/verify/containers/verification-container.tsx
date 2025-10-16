import React from 'react';
import { StepIndicator } from '../components/step-indicator';
import type { VerificationStep } from '../../../types/verify';

interface VerificationContainerProps {
  children: React.ReactNode;
  currentStep: VerificationStep;
}

const steps = [
  { id: 'ID_SELECTION', title: 'Select ID' },
  { id: 'ID_CAPTURE', title: 'Upload ID' },
  { id: 'BIOMETRIC_CAPTURE', title: 'Biometrics' },
  { id: 'SUBMISSION_REVIEW', title: 'Review' },
];

export function VerificationContainer({
  children,
  currentStep,
}: VerificationContainerProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 container mx-auto max-w-2xl py-8 duration-200">
      <h1 className="mb-6 text-center text-2xl font-bold md:mb-8 md:text-3xl">
        Account Verification
      </h1>
      {currentStep !== 'SUBMISSION_PENDING' && (
        <StepIndicator
          steps={steps.map((s) => s.title)}
          currentStep={currentStepIndex}
        />
      )}
      <div className="animate-in fade-in-0 mt-6 duration-200 md:mt-8">
        {children}
      </div>
    </div>
  );
}
