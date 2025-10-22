import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Biometrics from '../components/preview/biometrics';

import type {
  StepNavProps,
  GovernmentIdInfo,
  UserIDType,
  CaptureData,
} from '@/types/verify';

import NavigationButtons from '@/components/verify/components/navigation-buttons';
import UserID from '../components/preview/userID';
import UserInfo from '../components/preview/user-info';

type SubmissionReviewProps = StepNavProps & {
  userData: GovernmentIdInfo | null;
  userID: UserIDType | null;
  livenessCheckCaptures: CaptureData[];
};

export function SubmissionReview({
  userData,
  userID,
  livenessCheckCaptures,
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
        <Separator />
        {/* Biometric Verification Section */}
        <Biometrics livenessCheckCaptures={livenessCheckCaptures} />
        <NavigationButtons isLoading={false} onNext={onNext} onPrev={onPrev} />
      </CardContent>
    </Card>
  );
}
