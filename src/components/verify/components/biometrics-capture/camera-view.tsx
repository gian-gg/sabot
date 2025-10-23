import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { BIOMETRICS_INSTRUCTIONS } from '@/constants/verify';
import { Spinner } from '@/components/ui/spinner';
import { Disclaimer } from '@/components/ui/disclaimer';

const CameraView = ({
  videoRef,
  isCameraOn,
  startCamera,
  captureFrame,
  screenPrompt,
  error,
  isLoading,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isCameraOn: boolean;
  startCamera: () => Promise<void>;
  captureFrame: () => void;
  screenPrompt: () => string | undefined;
  error: string[];
  isLoading: boolean;
}) => {
  const [promptOverride, setPromptOverride] = useState<string | null>(null);
  const holdTimerRef = useRef<number | null>(null);

  // Handle capture click: show "Hold" then "Processing" until done
  const handleCaptureClick = () => {
    if (!isCameraOn || isLoading) return;

    // Clear any previous timers
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    setPromptOverride('Hold still');

    // After 2 seconds, switch to "Processing"
    holdTimerRef.current = window.setTimeout(() => {
      setPromptOverride('Processing');
    }, 2000);

    captureFrame();
  };

  // When loading completes, restore default prompt and clear timer
  useEffect(() => {
    if (!isLoading && promptOverride) {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      setPromptOverride(null);
    }
  }, [isLoading, promptOverride]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  const currentPrompt = promptOverride ?? screenPrompt();
  return (
    <>
      <div className="border-primary/30 from-primary/10 bg-background relative mb-4 flex aspect-video flex-col items-center justify-center border-2 bg-gradient-to-br to-transparent p-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-auto w-full ${isCameraOn ? 'block' : 'hidden'} `}
        />
        {!isCameraOn ? (
          <Button onClick={startCamera} size="lg">
            <Camera className="text-primary-foreground size-5" />
            Start
          </Button>
        ) : (
          <>
            <Button
              size="lg"
              className="mt-2 w-full"
              onClick={handleCaptureClick}
              disabled={!isCameraOn || isLoading}
            >
              <Camera className="text-primary-foreground size-5" />
              Capture
            </Button>

            {/* Head shape overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <svg
                aria-hidden="true"
                className="h-3/4 w-3/4"
                viewBox="0 0 200 200"
                preserveAspectRatio="xMidYMid meet"
              >
                <ellipse
                  cx="100"
                  cy="100"
                  rx="70"
                  ry="88"
                  className="stroke-primary/40 fill-none"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />
                {/* eye guides */}
                <circle cx="70" cy="95" r="3" className="fill-primary/70" />
                <circle cx="130" cy="95" r="3" className="fill-primary/70" />
                {/* nose/center marker */}
                <circle cx="100" cy="120" r="2" className="fill-primary/70" />
              </svg>
            </div>
          </>
        )}
      </div>

      <p className="mb-6 flex items-center justify-center gap-2 text-center text-lg font-medium">
        {(promptOverride === 'Processing' || isLoading) && <Spinner />}
        {currentPrompt}
      </p>

      {error.length > 0 && (
        <Disclaimer
          variant="error"
          className="mb-4"
          title="Error, please try again."
        >
          {error.length === 1 ? (
            error[0]
          ) : (
            <ul className="ml-5 list-disc space-y-1">
              {error.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          )}
        </Disclaimer>
      )}

      <Disclaimer variant="info" className="mb-4" title="Note">
        <ul className="ml-5 list-disc space-y-1">
          {BIOMETRICS_INSTRUCTIONS.map((instruction) => (
            <li key={instruction}>{instruction}</li>
          ))}
        </ul>
      </Disclaimer>
    </>
  );
};

export default CameraView;
