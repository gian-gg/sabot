import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

import type { CaptureData } from '@/types/verify';

import { LIVENESS_CHECK_STEPS } from '@/constants/verify';

type BiometricsProps = {
  livenessCheckCaptures: CaptureData[];
};

const Biometrics = ({ livenessCheckCaptures }: BiometricsProps) => {
  // Get the latest selfie capture (usually the last one)
  const latestCapture =
    livenessCheckCaptures.length > 0
      ? livenessCheckCaptures[livenessCheckCaptures.length - 1]
      : null;

  // Calculate overall verification status
  const allLivenessChecksVerified = livenessCheckCaptures.every(
    (capture) => capture.isLivenessVerified
  );
  const allFaceMatchesVerified = livenessCheckCaptures.every(
    (capture) => capture.isFaceMatchVerified
  );

  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold">Biometric Verification</h3>

      {/* Overall Status */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          {allLivenessChecksVerified ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">
            Liveness Check: {allLivenessChecksVerified ? 'Verified' : 'Failed'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {allFaceMatchesVerified ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">
            Face Match: {allFaceMatchesVerified ? 'Verified' : 'Failed'}
          </span>
          {latestCapture?.faceMatchConfidence && (
            <Badge variant="outline" className="ml-2">
              {(latestCapture.faceMatchConfidence * 100).toFixed(1)}% confidence
            </Badge>
          )}
        </div>
      </div>

      {/* Liveness Check Steps */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Completed Steps:</p>
        <div className="grid grid-cols-2 gap-2">
          {LIVENESS_CHECK_STEPS.map((step, index) => {
            const capture = livenessCheckCaptures[index];
            const isVerified = capture?.isLivenessVerified;
            return (
              <div
                key={step}
                className="bg-background flex items-center gap-2 rounded-md p-2"
              >
                {isVerified ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-xs">{step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Biometrics;
