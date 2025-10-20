'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import NavigationButtons from '@/components/verify/components/navigation-buttons';
import { useState, useRef, useEffect, useCallback } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [error, setError] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(capturedFrames.length);

  // Function to start the camera stream
  const startCamera = async () => {
    // Check if the browser supports mediaDevices
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Request access to the camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true, // We only want video
        });

        // Store the stream in a ref so we can stop it later
        streamRef.current = stream;

        // If we have a video element ref, set its source to the stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
        setError([]);
      } catch (err) {
        // Handle errors (e.g., user denies permission)
        setError([
          err instanceof Error ? err.message : 'Unknown error occurred',
        ]);
        setIsCameraOn(false);
      }
    } else {
      setError(['Your browser does not support camera access.']);
    }
  };

  // Function to stop the camera stream
  const stopCamera = useCallback(() => {
    // Stop all tracks from the stream ref
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Clear the video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  }, []);

  const captureFrame = async () => {
    if (!videoRef.current) return null;
    if (!isCameraOn) return null;
    if (!userIDCard?.file) return null;

    setIsLoading(true);
    setError([]);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      const stepName = LIVENESS_CHECK_STEPS[currentStep];

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const faceCaptureFile = new File([blob], 'face-capture.jpg', {
        type: 'image/jpeg',
      });

      // Call the Gemini liveness check verification
      try {
        const data = await verifyLivenessCheck(
          faceCaptureFile,
          userIDCard.file,
          stepName
        );
        console.log('Liveness Check Result:', data);

        if (data.notes.length > 0) {
          setError(data.notes);
          setIsLoading(false);
          return null;
        }

        // Store capture metadata
        const captureData: CaptureData = {
          ...data,
          step: stepName,
          timestamp: new Date().toISOString(),
        };

        setCapturedFrames((prev) => [...prev, captureData]);
        setCurrentStep((prev) => prev + 1);
      } catch (e) {
        setError([
          e instanceof Error ? e.message : 'Liveness verification failed.',
        ]);
        setIsLoading(false);
        return null;
      }
    }

    setIsLoading(false);
    return null;
  };

  // Function to get the current screen prompt
  const screenPrompt = () => {
    if (!isCameraOn) return 'Click "Start" to begin the liveness check.';
    if (currentStep < LIVENESS_CHECK_STEPS.length)
      return LIVENESS_CHECK_STEPS[currentStep];
  };

  const handleBack = () => {
    stopCamera();
    setError([]);
    setCapturedFrames([]);
    setIsLoading(false);
    setCurrentStep(0);

    if (onPrev) onPrev();
  };

  const handleDisableNext = () => {
    const isComplete = currentStep >= LIVENESS_CHECK_STEPS.length;
    return isLoading || !isComplete;
  };

  // This useEffect handles stopping the camera when the component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Stop camera when all steps are completed
  useEffect(() => {
    if (isCameraOn && currentStep >= LIVENESS_CHECK_STEPS.length) {
      stopCamera();
    }
  }, [currentStep, isCameraOn, stopCamera]);

  // Render summary view when all steps are completed
  const isComplete = currentStep >= LIVENESS_CHECK_STEPS.length;

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
          // Summary view when all steps are completed
          <Summary capturedFrames={capturedFrames} />
        ) : (
          // Camera view when steps are in progress
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
          disableNext={handleDisableNext()}
          onNext={onNext}
          onPrev={handleBack}
        />
      </CardContent>
    </Card>
  );
}
