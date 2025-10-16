import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Camera } from 'lucide-react';

import type { StepNavProps } from '../../../types/verify';

type BiometricCaptureProps = StepNavProps;

export function BiometricCapture({ onNext, onPrev }: BiometricCaptureProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liveness Check</CardTitle>
        <CardDescription>
          Position your face in the oval and follow the instructions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gray-900">
          <Camera className="h-24 w-24 text-gray-600" />
          <div
            className="ring-primary/10 absolute inset-0 animate-pulse rounded-full border-[16px] border-white/40 ring-4"
            style={{ margin: '10%' }}
          ></div>
        </div>
        <p className="mb-6 text-center text-lg font-medium">
          Position your face in the oval and smile
        </p>
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onPrev}
            className="transition-all duration-150 active:scale-[0.98]"
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            className="transition-all duration-150 active:scale-[0.98]"
          >
            Capture
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
