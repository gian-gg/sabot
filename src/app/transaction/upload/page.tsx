'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { UploadScreenshotPage } from '@/components/transaction/upload/upload-screenshot-page';
import { Loader2 } from 'lucide-react';

function UploadPageContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('id');

  if (!transactionId) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Invalid request. Transaction ID is required.
          </p>
        </div>
      </div>
    );
  }

  return <UploadScreenshotPage transactionId={transactionId} />;
}

export default function TransactionUploadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <UploadPageContent />
    </Suspense>
  );
}
