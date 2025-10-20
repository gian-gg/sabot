import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Camera, AlertTriangle, Pin } from 'lucide-react';
import { BIOMETRICS_INSTRUCTIONS } from '@/constants/verify';
import { Spinner } from '@/components/ui/spinner';

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
              onClick={captureFrame}
              disabled={!isCameraOn || isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Processing
                </>
              ) : (
                <>
                  <Camera className="text-primary-foreground size-5" />
                  Capture
                </>
              )}
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

      <p className="mb-6 text-center text-lg font-medium">{screenPrompt()}</p>

      {error.length > 0 && (
        // make a component for this
        <Alert
          variant="destructive"
          className="border-destructive bg-destructive/5 mt-2"
        >
          <AlertTriangle className="mt-0.5 size-4" />
          <AlertTitle>Error, please try again.</AlertTitle>
          <AlertDescription>
            {error.length === 1 ? (
              error[0]
            ) : (
              <ul className="ml-5 list-disc space-y-1">
                {error.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* make a component for this */}
      <Alert className="mt-2 border-2 border-dashed border-blue-400/30 bg-gradient-to-br from-blue-400/10 to-transparent p-4">
        <Pin className="h-4 w-4 flex-shrink-0" />
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>
          <ul className="ml-5 list-disc space-y-1">
            {BIOMETRICS_INSTRUCTIONS.map((instruction) => (
              <li key={instruction}>{instruction}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </>
  );
};

export default CameraView;
