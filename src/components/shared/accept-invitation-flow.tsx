'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Step {
  key: string;
  description: string;
}

interface AcceptInvitationFlowProps {
  type: 'agreement' | 'transaction';
  steps: Step[];
  currentStep: string;
  children: React.ReactNode;
}

export function AcceptInvitationFlow({
  type,
  steps,
  currentStep,
  children,
}: AcceptInvitationFlowProps) {
  const getStepNumber = () => {
    const index = steps.findIndex((s) => s.key === currentStep);
    return index >= 0 ? index + 1 : 1;
  };

  const getCurrentStepDescription = () => {
    const step = steps.find((s) => s.key === currentStep);
    return step?.description || '';
  };

  const isAgreement = type === 'agreement';

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">
                {isAgreement ? 'Agreement' : 'Transaction'} Invitation
              </CardTitle>
              <CardDescription>{getCurrentStepDescription()}</CardDescription>
            </div>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary"
            >
              Step {getStepNumber()}/{steps.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
