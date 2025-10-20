import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import type { CaptureData } from '@/types/verify';

const Summary = ({ capturedFrames }: { capturedFrames: CaptureData[] }) => {
  return (
    <>
      <div className="bg-card rounded-lg border p-4">
        <h3 className="mb-3 font-semibold">Verification Steps</h3>

        <div className="grid gap-2 sm:grid-cols-2">
          {capturedFrames.map((frame, index) => (
            <div
              key={index}
              className="bg-muted/30 flex items-center gap-2 rounded-md border p-2.5"
            >
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {index + 1}. {frame.step}
                </div>
                <div className="text-muted-foreground flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(frame.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {frame.faceMatchConfidence !== null && (
                    <span className="text-green-600">
                      {Math.round(frame.faceMatchConfidence * 100)}% match
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Alert className="border-primary/30 from-primary/10 mt-2 border-2 border-dashed bg-gradient-to-br to-transparent p-4">
        <CheckCircle2 className="h-5 w-5" />
        <AlertTitle>Liveness Check Complete</AlertTitle>
        <AlertDescription>
          All {capturedFrames.length} verification steps completed successfully.
          You may now continue.
        </AlertDescription>
      </Alert>
    </>
  );
};

export default Summary;
