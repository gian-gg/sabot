import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';

import type { StepNavProps } from '../../../types/verify';

type IdCaptureProps = StepNavProps;

export function IdCapture({ onNext, onPrev }: IdCaptureProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Photograph your ID</CardTitle>
        <CardDescription>
          Please take a clear photo of the front of your ID.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="button"
          tabIndex={0}
          className="border-muted-foreground/20 focus-visible:ring-primary hover:border-primary mb-4 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors outline-none focus-visible:ring-2"
        >
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, up to 10MB</p>
        </div>
        <ul className="text-muted-foreground mb-6 list-inside list-disc space-y-1 text-sm">
          <li>Avoid glare and shadows.</li>
          <li>Use a well-lit area.</li>
          <li>Ensure all text is readable.</li>
        </ul>
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
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
