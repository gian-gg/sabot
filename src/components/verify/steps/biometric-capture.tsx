'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import NavigationButtons from '@/components/verify/components/navigation-buttons';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Summary from '@/components/verify/components/biometrics-capture/summary';
import CameraView from '@/components/verify/components/biometrics-capture/camera-view';
import {
  LIVENESS_CHECK_STEPS_FIXED,
  LIVENESS_CHECK_STEPS_RANDOM,
  LIVENESS_CHECK_MAX_STEPS,
} from '@/constants/verify';
import { verifyLivenessCheck } from '@/lib/gemini/verify';

import type { CaptureData, StepNavProps, UserIDType } from '@/types/verify';

// Utility function to generate random steps
const generateRandomSteps = (count: number): string[] => {
  const availableSteps = [...LIVENESS_CHECK_STEPS_RANDOM];
  const selected: string[] = [];

  for (let i = 0; i < count && availableSteps.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableSteps.length);
    selected.push(availableSteps[randomIndex]);
    availableSteps.splice(randomIndex, 1); // Remove to avoid duplicates
  }

  return selected;
};

export function BiometricCapture({
  onNext,
  onPrev,
  userIDCard,
  capturedFrames,
  setCapturedFrames,
}: StepNavProps & {
  userIDCard: UserIDType | null;
  capturedFrames: CaptureData[];
  setCapturedFrames: React.Dispatch<React.SetStateAction<CaptureData[]>>;
}) {
  // Refs for video element and media stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate steps sequence: fixed steps + random steps
  const allSteps = useMemo(() => {
    const numRandomSteps = Math.max(
      0,
      LIVENESS_CHECK_MAX_STEPS - LIVENESS_CHECK_STEPS_FIXED.length
    );
    const randomSteps = generateRandomSteps(numRandomSteps);
    return [...LIVENESS_CHECK_STEPS_FIXED, ...randomSteps];
  }, []); // Only generate once on mount

  // Component state
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(capturedFrames.length);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(['Your browser does not support camera access.']);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsCameraOn(true);
      setError([]);
    } catch (err) {
      setError([err instanceof Error ? err.message : 'Camera access denied']);
      setIsCameraOn(false);
    }
  }, []);

  // Cleanup camera stream and stop all tracks
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  }, []);

  // Capture current video frame and verify liveness
  const captureFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !isCameraOn || !userIDCard?.file) return;

    setError([]);
    setIsLoading(true);

    // Yield one frame so UI can paint
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve())
    );

    try {
      // Convert video frame to image file
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) =>
            b ? resolve(b) : reject(new Error('Canvas conversion failed')),
          'image/jpeg',
          0.95
        );
      });

      const faceCaptureFile = new File([blob], 'face-capture.jpg', {
        type: 'image/jpeg',
      });

      const stepName = allSteps[currentStep];

      // Verify liveness with Gemini API
      const data = await verifyLivenessCheck(
        faceCaptureFile,
        userIDCard.file,
        stepName
      );

      if (data.notes.length > 0) {
        setError(data.notes);
        return;
      }

      // Save successful capture
      const captureData: CaptureData = {
        ...data,
        step: stepName,
        timestamp: new Date().toISOString(),
      };

      setCapturedFrames((prev) => [...prev, captureData]);
      setCurrentStep((prev) => prev + 1);
    } catch (e) {
      setError([
        e instanceof Error ? e.message : 'Liveness verification failed',
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isCameraOn, userIDCard?.file, currentStep, setCapturedFrames, allSteps]);

  const screenPrompt = useCallback(() => {
    if (!isCameraOn) return 'Click "Start" to begin the liveness check.';
    return currentStep < allSteps.length ? allSteps[currentStep] : undefined;
  }, [isCameraOn, currentStep, allSteps]);

  // Reset state and navigate back
  const handleBack = useCallback(() => {
    stopCamera();
    setError([]);
    setCapturedFrames([]);
    setIsLoading(false);
    setCurrentStep(0);
    onPrev?.();
  }, [stopCamera, setCapturedFrames, onPrev]);

  // Memoize completion status
  const isComplete = useMemo(
    () => currentStep >= allSteps.length,
    [currentStep, allSteps.length]
  );

  // Determine if next button should be disabled
  const disableNext = useMemo(
    () => isLoading || !isComplete,
    [isLoading, isComplete]
  );

  // Cleanup camera on unmount
  useEffect(() => stopCamera, [stopCamera]);

  // Auto-stop camera when all steps complete
  useEffect(() => {
    if (isCameraOn && isComplete) {
      stopCamera();
    }
  }, [isComplete, isCameraOn, stopCamera]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liveness Check</CardTitle>
        <CardDescription>
          This step helps verify that you are a real person by capturing several
          captures. Please follow the on-screen prompts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isComplete ? (
          <Summary capturedFrames={capturedFrames} />
        ) : (
          <CameraView
            videoRef={videoRef}
            isCameraOn={isCameraOn}
            startCamera={startCamera}
            captureFrame={captureFrame}
            screenPrompt={screenPrompt}
            error={error}
            isLoading={isLoading}
          />
        )}

        <NavigationButtons
          isLoading={isLoading}
          disableNext={disableNext}
          onNext={onNext}
          onPrev={handleBack}
        />
      </CardContent>
    </Card>
  );
}
