import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

import type { StepNavProps } from '../../../types/verify';

type SubmissionReviewProps = StepNavProps;

export function SubmissionReview({ onNext, onPrev }: SubmissionReviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review your submission</CardTitle>
        <CardDescription>
          Please ensure all information is correct before submitting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">ID Document</h3>
            <div className="mt-2 flex justify-center rounded-md bg-gray-100 p-4 dark:bg-gray-800">
              <Image
                src="https://placehold.co/400x250/EFEFEF/AAAAAA&text=ID+Image"
                alt="ID Document"
                width={400}
                height={250}
                className="h-auto max-w-full rounded-md"
                unoptimized
                priority={false}
              />
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold">Live Selfie</h3>
            <div className="mt-2 flex justify-center rounded-md bg-gray-100 p-4 dark:bg-gray-800">
              <Image
                src="https://placehold.co/300x300/EFEFEF/AAAAAA&text=Selfie"
                alt="Live Selfie"
                width={300}
                height={300}
                className="h-48 w-48 rounded-full object-cover"
                unoptimized
                priority={false}
              />
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="text-lg font-semibold">Extracted Information</h3>
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between border-b py-2">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-medium">Juan Dela Cruz</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span className="text-muted-foreground">Date of Birth</span>
                <span className="font-medium">January 1, 1990</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Address</span>
                <span className="font-medium">
                  123 Rizal St, Manila, Philippines
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-between">
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
            Submit for Verification
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
