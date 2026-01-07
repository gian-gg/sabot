'use client';

import { Suspense } from 'react';
import { CreateInvitationPage } from '@/components/agreement/invite/create-invitation-page';
import { Loader2 } from 'lucide-react';

export default function AgreementInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CreateInvitationPage />
    </Suspense>
  );
}
