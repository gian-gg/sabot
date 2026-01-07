'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md border-neutral-800/60 bg-neutral-900/40">
          <CardContent className="pt-6 pb-6">
            <div className="space-y-4 text-center">
              <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
              <p className="text-neutral-400">
                The page you&apos;re looking for doesn&apos;t exist.
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
                <Button asChild variant="outline">
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
