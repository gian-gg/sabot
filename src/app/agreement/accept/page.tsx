'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AcceptAgreementPage } from '@/components/agreement/invite/accept-invitation-page';
import { Loader2 } from 'lucide-react';

function AcceptPageContent() {
  const searchParams = useSearchParams();
  const agreementId = searchParams.get('id');

  if (!agreementId) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Invalid invitation link. Agreement ID is required.
          </p>
        </div>
      </div>
    );
  }

  return <AcceptAgreementPage agreementId={agreementId} />;
}

export default function AgreementAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <AcceptPageContent />
    </Suspense>
  );
}
