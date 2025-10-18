'use client';

import { useState } from 'react';
import {
  BiometricCapture,
  IdCapture,
  IdSelection,
  SubmissionPending,
  SubmissionReview,
  VerificationContainer,
} from '@/components/verify';
import type {
  VerificationStep,
  GovernmentIdInfo,
  UserIDType,
} from '@/types/verify';

export default function VerifyPage() {
  const [step, setStep] = useState<VerificationStep>('ID_SELECTION');
  const [userID, setUserID] = useState<UserIDType | null>(null);
  const [userData, setUserData] = useState<GovernmentIdInfo | null>(null);

  const goToNextStep = () => {
    const steps: VerificationStep[] = [
      'ID_SELECTION',
      'ID_CAPTURE',
      'BIOMETRIC_CAPTURE',
      'SUBMISSION_REVIEW',
      'SUBMISSION_PENDING',
    ];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const goToPrevStep = () => {
    const steps: VerificationStep[] = [
      'ID_SELECTION',
      'ID_CAPTURE',
      'BIOMETRIC_CAPTURE',
      'SUBMISSION_REVIEW',
    ];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'ID_SELECTION':
        return (
          <IdSelection
            selectedIDType={userID}
            setSelectedIDType={setUserID}
            onNext={goToNextStep}
          />
        );
      case 'ID_CAPTURE':
        return (
          <IdCapture
            selectedIDType={userID}
            setSelectedIDType={setUserID}
            userData={userData}
            setUserData={setUserData}
            onNext={goToNextStep}
            onPrev={goToPrevStep}
          />
        );
      case 'BIOMETRIC_CAPTURE':
        return <BiometricCapture onNext={goToNextStep} onPrev={goToPrevStep} />;
      case 'SUBMISSION_REVIEW':
        return <SubmissionReview onNext={goToNextStep} onPrev={goToPrevStep} />;
      case 'SUBMISSION_PENDING':
        return <SubmissionPending />;
      default:
        return (
          <IdSelection
            selectedIDType={userID}
            setSelectedIDType={setUserID}
            onNext={goToNextStep}
          />
        );
    }
  };

  return (
    <VerificationContainer currentStep={step}>
      {renderStep()}
    </VerificationContainer>
  );
}
