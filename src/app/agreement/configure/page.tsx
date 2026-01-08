'use client';

import { ProjectQuestionnaire } from '@/components/agreement/invite/project-questionnaire';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useAgreementStatus } from '@/hooks/useAgreementStatus';
import { toast } from 'sonner';

function ConfigureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const agreementId = searchParams.get('id');

  const { status } = useAgreementStatus(agreementId);

  // Trigger automatic transition when both submit idea blocks
  useEffect(() => {
    console.log('🔄 [ConfigurePage] Status update:', {
      bothSubmittedIdeaBlocks: status?.both_submitted_idea_blocks,
      agreementStatus: status?.agreement.status,
      isReadyForNextStep: status?.is_ready_for_next_step,
      participantCount: status?.participants?.length,
      agreementId,
      timestamp: new Date().toISOString(),
    });

    if (
      status?.both_submitted_idea_blocks &&
      status.agreement.status === 'in-progress'
    ) {
      console.log(
        '🚀 [ConfigurePage] Both submitted idea blocks! Navigating to editor...',
        {
          agreementId,
          agreementStatus: status.agreement.status,
          participantCount: status.participants?.length,
        }
      );

      // Show persistent loading toast during transition - stays until new page loads
      toast.loading('🎉 Content ready! Moving to editor...', {
        duration: Infinity, // Stay visible during entire navigation
      });

      setTimeout(() => {
        console.log('🎯 [ConfigurePage] Executing navigation to active editor');
        // Don't dismiss toast - let it stay visible during page load
        router.push(`/agreement/${agreementId}/active`);
      }, 500); // Short delay just to ensure toast renders
    }
  }, [
    status?.both_submitted_idea_blocks,
    status?.agreement.status,
    agreementId,
    router,
  ]);

  if (!agreementId) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12">
            <p className="text-muted-foreground text-center">
              Invalid agreement ID
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleQuestionnaireComplete = () => {
    // This will be called when both parties have submitted
    console.log(
      '🎯 [ConfigurePage] Questionnaire complete callback triggered - navigating to active editor'
    );
    router.push(`/agreement/${agreementId}/active`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">Agreement Configuration</CardTitle>
              <CardDescription>
                Tell us about your agreement to get started
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ProjectQuestionnaire
            agreementId={agreementId}
            onComplete={handleQuestionnaireComplete}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function ConfigureLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
      <Card className="w-full max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading configuration...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ConfigurePage() {
  return (
    <Suspense fallback={<ConfigureLoading />}>
      <ConfigureContent />
    </Suspense>
  );
}
