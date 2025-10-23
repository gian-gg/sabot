'use client';

import React from 'react';
import { Card, CardContent } from '../ui/card';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

const Denied = () => {
  const router = useRouter();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <ShieldAlert className="text-destructive h-16 w-16" />
          <div className="text-center">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-muted-foreground mt-2">
              You don&apos;t have permission to access this page.
            </p>
          </div>
          <Button onClick={() => router.push('/home')} className="mt-4">
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Denied;
