'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, Loader2, ArrowLeft, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PartiesInfo } from '@/components/agreement/id/parties-info';
import { AgreementDetails } from '@/components/agreement/id/agreement-details';
import { DocumentStructure } from '@/components/agreement/id/document-structure';
import { AISuggestions } from '@/components/agreement/id/ai-suggestions';
import { mockUser, mockInviter } from '@/lib/mock-data/agreements';

interface Party {
  id: string;
  name: string;
  email: string;
  color: string;
  hasConfirmed: boolean;
}

// Mock parties data - extended from mock-data
const mockParties: Party[] = [
  {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    color: mockUser.color,
    hasConfirmed: false,
  },
  {
    id: mockInviter.id,
    name: mockInviter.name,
    email: mockInviter.email,
    color: mockInviter.color,
    hasConfirmed: false,
  },
];

export default function FinalizePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>(mockParties);
  const [currentUserConfirmed, setCurrentUserConfirmed] = useState(false);
  const currentUserId = '1'; // Mock current user

  const handleConfirm = () => {
    setCurrentUserConfirmed(true);
    setParties(
      parties.map((party) =>
        party.id === currentUserId ? { ...party, hasConfirmed: true } : party
      )
    );
  };

  const handleCancel = () => {
    router.push(`/agreement/${params.id}/active`);
  };

  const allConfirmed = parties.every((party) => party.hasConfirmed);
  const waitingForOthers = currentUserConfirmed && !allConfirmed;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-border/50 bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/agreement/${params.id}/active`}
              className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Editor</span>
            </Link>
            <div className="bg-border h-6 w-px" />
            <h1 className="text-foreground text-xl font-bold">
              Finalize <span className="text-primary">Agreement</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {parties.map((party) => (
              <div key={party.id} className="flex items-center gap-2">
                <Avatar
                  className={cn(
                    'h-8 w-8 border-2',
                    party.hasConfirmed ? 'border-primary' : 'border-border'
                  )}
                >
                  <AvatarFallback style={{ backgroundColor: party.color }}>
                    {party.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                {party.hasConfirmed && (
                  <Check className="text-primary h-4 w-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Status Banner */}
        {waitingForOthers && (
          <Card className="bg-primary/5 border-primary/20 mb-8 p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
              <div>
                <h3 className="text-foreground font-semibold">
                  Waiting for other parties to confirm
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  You&apos;ve confirmed the agreement. We&apos;re waiting for{' '}
                  {parties
                    .filter((p) => !p.hasConfirmed)
                    .map((p) => p.name)
                    .join(', ')}{' '}
                  to confirm.
                </p>
              </div>
            </div>
          </Card>
        )}

        {allConfirmed && (
          <Card className="bg-primary/10 border-primary/30 mb-8 p-6">
            <div className="flex items-center gap-3">
              <Check className="text-primary h-5 w-5" />
              <div>
                <h3 className="text-foreground font-semibold">
                  Agreement Finalized!
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  All parties have confirmed. The agreement is now locked and
                  ready for download.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Agreement Overview */}
          <div className="space-y-8">
            {/* Confirmation Status Card */}
            <Card className="p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <FileCheck className="text-primary h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Confirmation Status</h3>
                  <p className="text-muted-foreground text-sm">
                    Review party confirmations
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {parties.map((party) => (
                  <div
                    key={party.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          style={{ backgroundColor: party.color }}
                        >
                          {party.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{party.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {party.email}
                        </p>
                      </div>
                    </div>
                    {party.hasConfirmed ? (
                      <div className="text-primary flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">Confirmed</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Pending
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              {!currentUserConfirmed && (
                <div className="mt-6 flex items-center justify-center gap-4 border-t pt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleCancel}
                    className="min-w-32 bg-transparent"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleConfirm}
                    className="min-w-32"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Agreement
                  </Button>
                </div>
              )}
            </Card>

            {/* Parties Info */}
            <PartiesInfo />

            {/* Agreement Details */}
            <AgreementDetails />
          </div>

          {/* Right Column - Document Structure & AI */}
          <div className="space-y-8">
            {/* Document Structure */}
            <DocumentStructure />

            {/* AI Suggestions */}
            <AISuggestions />
          </div>
        </div>
      </div>
    </div>
  );
}
