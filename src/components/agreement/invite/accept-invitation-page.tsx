'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReviewAgreementInvitation } from '@/components/agreement/invite/review-invitation';
import { ProjectQuestionnaire } from '@/components/agreement/editor/project-questionnaire';

type Step = 'review' | 'questionnaire';

interface AcceptInvitationPageProps {
  invitationId: string;
}

// Mock inviter data - replace with actual data fetching
const mockInviter = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: undefined,
  trustScore: 92,
  isVerified: true,
  completedTransactions: 15,
};

export function AcceptInvitationPage({
  invitationId,
}: AcceptInvitationPageProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('review');

  const handleAcceptInvite = () => {
    setStep('questionnaire');
  };

  const handleDecline = () => {
    router.push(ROUTES.HOME.ROOT);
  };

  const handleQuestionnaireComplete = () => {
    // Navigate directly to the editor
    router.push(`/agreement/${invitationId}/active`);
  };

  const getStepNumber = () => {
    switch (step) {
      case 'review':
        return 1;
      case 'questionnaire':
        return 2;
      default:
        return 1;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">Agreement Invitation</CardTitle>
              <CardDescription>
                {step === 'review' &&
                  "You've been invited to collaborate on an agreement"}
                {step === 'questionnaire' &&
                  'Tell us about your agreement to get started'}
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary"
            >
              Step {getStepNumber()}/2
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'review' && (
            <ReviewAgreementInvitation
              inviter={mockInviter}
              onAccept={handleAcceptInvite}
              onDecline={handleDecline}
            />
          )}

          {step === 'questionnaire' && (
            <ProjectQuestionnaire onComplete={handleQuestionnaireComplete} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
