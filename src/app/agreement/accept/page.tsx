'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AcceptAgreementPage } from '@/components/agreement/accept/page';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

function AcceptContent() {
  const searchParams = useSearchParams();
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

  return <AcceptAgreementPage agreementId={agreementId} />;
}

function AcceptLoading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
      <Card className="w-full max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading agreement...</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptPage() {
  return (
    <Suspense fallback={<AcceptLoading />}>
      <AcceptContent />
    </Suspense>
  );
}
