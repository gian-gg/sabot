'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthCodeErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="bg-destructive/10 rounded-full p-3">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Authentication Error
            </h1>
            <p className="text-muted-foreground text-sm">
              {error ||
                'There was an error setting up your wallet. Please try again.'}
            </p>
          </div>

          <Button asChild className="w-full">
            <Link href="/">Return to Sign In</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
