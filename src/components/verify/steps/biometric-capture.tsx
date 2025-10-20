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
import { LIVENESS_CHECK_STEPS } from '@/constants/verify';
import { verifyLivenessCheck } from '@/lib/gemini/verify';

import type { CaptureData, StepNavProps, UserIDType } from '@/types/verify';

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

    setIsLoading(true);
    setError([]);

    try {
      // Convert video frame to image file
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas context unavailable');

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob more efficiently
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

      const stepName = LIVENESS_CHECK_STEPS[currentStep];

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
  }, [isCameraOn, userIDCard?.file, currentStep, setCapturedFrames]);

  // Get instruction text for current step
  const screenPrompt = useCallback(() => {
    if (!isCameraOn) return 'Click "Start" to begin the liveness check.';
    return currentStep < LIVENESS_CHECK_STEPS.length
      ? LIVENESS_CHECK_STEPS[currentStep]
      : undefined;
  }, [isCameraOn, currentStep]);

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
    () => currentStep >= LIVENESS_CHECK_STEPS.length,
    [currentStep]
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
          Position your face in the oval and follow the instructions.
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
