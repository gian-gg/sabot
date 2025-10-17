'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreateTransactionPage } from '@/components/transaction/invite/create-transaction-page';
import { AcceptTransactionPage } from '@/components/transaction/invite/accept-transaction-page';
import { Loader2 } from 'lucide-react';

function InvitePageContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');

  // If there's an ID, show the accept transaction flow
  if (transactionId) {
    return <AcceptTransactionPage transactionId={transactionId} />;
  }

  // Otherwise, show the create transaction flow
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
