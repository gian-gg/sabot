'use client';

import { Suspense } from 'react';
import { CreateTransactionPage } from '@/components/transaction/invite/create-invitation-page';
import { Loader2 } from 'lucide-react';

function InvitePageContent() {
  // This page is for CREATING transactions and sharing invite links
  // The invite link will point to /transaction/accept?id=xxx
  return <CreateTransactionPage />;
}

export default function TransactionInvitePage() {
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
