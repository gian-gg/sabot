import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import type {
  StepNavProps,
  GovernmentIdInfo,
  UserIDType,
  CaptureData,
} from '@/types/verify';

import NavigationButtons from '@/components/verify/components/navigation-buttons';
import UserID from '../components/preview/userID';
import UserInfo from '../components/preview/user-info';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

type SubmissionReviewProps = StepNavProps & {
  userData: GovernmentIdInfo | null;
  userID: UserIDType | null;
  livenessCheckCaptures: CaptureData[];
};

export function SubmissionReview({
  userData,
  userID,
  onNext,
  onPrev,
}: SubmissionReviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Submission</CardTitle>
        <CardDescription>
          Please review all information carefully before submitting your
          verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <UserID userID={userID} />
        <Separator />
        {/* Extracted Information Section */}
        <UserInfo userData={userData} />
        <Alert className="border-primary bg-primary/5 mt-2">
          <AlertTriangle className="mt-0.5 size-4" />
          <AlertTitle>Review Submission</AlertTitle>
          <AlertDescription>
            Please ensure all information is correct before submitting. Once
            submitted, changes cannot be made.
          </AlertDescription>
        </Alert>
        <NavigationButtons isLoading={false} onNext={onNext} onPrev={onPrev} />
      </CardContent>
    </Card>
  );
}
