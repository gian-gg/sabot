'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { CreateTransactionForm } from '@/components/transaction/invite/create-transaction-form';
import { Loader2 } from 'lucide-react';

function TransactionNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  // Try to get transactionId from path params first, then search params
  const transactionId = (params.id as string) || searchParams.get('id');

  const handleTransactionCreated = (id: string) => {
    // Redirect to invitation created view (only for new transactions)
    router.push(`/transaction/invite?created=${id}`);
  };

  return (
    <CreateTransactionForm
      transactionId={transactionId || undefined}
      onTransactionCreated={handleTransactionCreated}
    />
  );
}

export default function TransactionNewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <TransactionNewContent />
    </Suspense>
  );
}
