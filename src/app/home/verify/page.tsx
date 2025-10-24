'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BiometricCapture,
  IdCapture,
  IdSelection,
  PermissionConsent,
  SubmissionPending,
  SubmissionReview,
  VerificationContainer,
} from '@/components/verify';
import type {
  VerificationStep,
  GovernmentIdInfo,
  UserIDType,
  CaptureData,
} from '@/types/verify';
import { useUserStore } from '@/store/user/userStore';
import { submitVerificationRequest } from '@/lib/supabase/db/verify';
import { updateUserVerificationStatus } from '@/lib/supabase/db/user';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function VerifyPage() {
  const router = useRouter();
  const user = useUserStore();

  const [step, setStep] = useState<VerificationStep>('PERMISSION_CONSENT');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userID, setUserID] = useState<UserIDType | null>(null); // step 1
  const [userData, setUserData] = useState<GovernmentIdInfo | null>(null); // step 2
  const [livenessCheckCaptures, setLivenessCheckCaptures] = useState<
    CaptureData[]
  >([]); // step 3
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToNextStep = () => {
    const steps: VerificationStep[] = [
      'PERMISSION_CONSENT',
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
      'PERMISSION_CONSENT',
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

  const faceMatchConfidence = useMemo(() => {
    if (!livenessCheckCaptures.length) return 0;
    const vals = livenessCheckCaptures
      .map((c) => c.faceMatchConfidence)
      .filter((v): v is number => typeof v === 'number');
    if (!vals.length) return 0;
    // Use max confidence across captures
    return Math.max(...vals);
  }, [livenessCheckCaptures]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    // Basic validations
    if (!user?.id || !user?.name || !user?.email) {
      toast.error('Missing user information. Please sign in again.');
      return;
    }
    if (!userID?.type || !userID?.file) {
      toast.error('Please select an ID type and upload your ID.');
      return;
    }
    if (!userData) {
      toast.error('Please complete your ID details.');
      return;
    }

    const retryCount = 3;
    let attempt = 0;

    while (attempt < retryCount) {
      try {
        setIsSubmitting(true);
        setUploadProgress(0);

        // Submit verification request with progress tracking
        await submitVerificationRequest({
          userID: user.id,
          userName: user.name,
          userEmail: user.email,
          idType: userID.type,
          govIdFile: userID.file,
          governmentIdInfo: userData,
          faceMatchConfidence,
        });

        user.setVerificationStatus('pending');
        setStep('SUBMISSION_PENDING');
        toast.success(
          'Verification submitted. We will notify you once reviewed.'
        );
        break;
      } catch (e) {
        attempt++;
        if (attempt === retryCount) {
          const msg = e instanceof Error ? e.message : 'Submission failed';
          toast.error(`${msg} - Please try again`);
        } else {
          // Wait before retry with exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * Math.pow(2, attempt))
          );
          toast.info(
            `Retrying submission... (Attempt ${attempt + 1}/${retryCount})`
          );
        }
      }
    }
    setIsSubmitting(false);
    setUploadProgress(0);
  };

  const isPending = user.verificationStatus === 'pending';
  const isComplete = user.verificationStatus === 'complete';

  // Navigate away after verification is complete
  useEffect(() => {
    if (isComplete) {
      router.replace(ROUTES.HOME.ROOT);
    }
  }, [isComplete, router]);

  if (isComplete) {
    // Render nothing while redirecting to avoid state updates during render
    return null;
  }
  if (isPending) {
    return <SubmissionPending />;
  }

  const renderStep = () => {
    switch (step) {
      case 'PERMISSION_CONSENT':
        return <PermissionConsent onNext={goToNextStep} />;
      case 'ID_SELECTION':
        return (
          <IdSelection
            selectedIDType={userID}
            setSelectedIDType={setUserID}
            onNext={goToNextStep}
            onPrev={goToPrevStep}
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
        return (
          <BiometricCapture
            capturedFrames={livenessCheckCaptures}
            setCapturedFrames={setLivenessCheckCaptures}
            userIDCard={userID}
            onNext={goToNextStep}
            onPrev={goToPrevStep}
          />
        );
      case 'SUBMISSION_REVIEW':
        return (
          <SubmissionReview
            userData={userData}
            userID={userID}
            livenessCheckCaptures={livenessCheckCaptures}
            onNext={handleSubmit}
            onPrev={goToPrevStep}
            loading={isSubmitting}
          />
        );
      case 'SUBMISSION_PENDING':
        return <SubmissionPending />;
      default:
        return <PermissionConsent onNext={goToNextStep} />;
    }
  };

  return (
    <VerificationContainer currentStep={step}>
      {renderStep()}
    </VerificationContainer>
  );
}
