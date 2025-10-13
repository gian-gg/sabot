'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/core/page-header';

export default function AgreementInvite() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950">
      <PageHeader>
        <div>
          <h1 className="text-2xl font-bold text-white">Agreement Invite</h1>
          <p className="text-neutral-400">Invite participants to agreement</p>
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 py-8">
        <Card className="border-neutral-800/60 bg-gradient-to-b from-neutral-900/40 to-neutral-950/60">
          <CardHeader>
            <CardTitle className="text-white">Agreement Invite</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-400">
              Agreement invite page - implementation coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
