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
import { Disclaimer } from '@/components/ui/disclaimer';

type SubmissionReviewProps = StepNavProps & {
  userData: GovernmentIdInfo | null;
  userID: UserIDType | null;
  livenessCheckCaptures: CaptureData[];
  loading: boolean;
};

export function SubmissionReview({
  userData,
  userID,
  onNext,
  onPrev,
  loading,
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

        <Disclaimer
          variant="success"
          className="mb-4"
          title="Review Submission"
        >
          Please ensure all information is correct before submitting. Once
          submitted, changes cannot be made.
        </Disclaimer>
        <NavigationButtons
          isLoading={loading}
          onNext={onNext}
          onPrev={onPrev}
        />
      </CardContent>
    </Card>
  );
}
