'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/core/page-header';

export default function AgreementConfigure() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950">
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold text-white">Configure Agreement</h1>
          <p className="text-neutral-400">Configure agreement settings</p>
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
          <CardHeader>
            <CardTitle className="text-white">
              Agreement Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-400">
              Agreement configuration page - implementation coming soon
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
