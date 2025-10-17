'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreateInvitationPage } from '@/components/agreement/invite/create-invitation-page';
import { AcceptInvitationPage } from '@/components/agreement/invite/accept-invitation-page';
import { Loader2 } from 'lucide-react';

function InvitePageContent() {
  const searchParams = useSearchParams();
  const invitationId = searchParams.get('id');

  // If there's an ID, show the accept invitation flow
  if (invitationId) {
    return <AcceptInvitationPage invitationId={invitationId} />;
  }

  // Otherwise, show the create invitation flow
  return <CreateInvitationPage />;
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <InvitePageContent />
    </Suspense>
  );
}
