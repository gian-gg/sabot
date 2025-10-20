'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AcceptTransactionPage } from '@/components/transaction/invite/accept-invitation-page';
import { Loader2 } from 'lucide-react';

function AcceptPageContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');

  if (!transactionId) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Invalid invitation link. Transaction ID is required.
          </p>
        </div>
      </div>
    );
  }

  return <AcceptTransactionPage transactionId={transactionId} />;
}

export default function TransactionAcceptPage() {
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
