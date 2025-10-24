'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProjectQuestionnaire } from '@/components/agreement/invite/project-questionnaire';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

function ConfigureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const agreementId = searchParams.get('id');

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
    // Navigate directly to the editor
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
          <ProjectQuestionnaire onComplete={handleQuestionnaireComplete} />
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
