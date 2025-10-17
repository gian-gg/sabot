'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, X, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Party {
  id: string;
  name: string;
  email: string;
  color: string;
  hasConfirmed: boolean;
}

// Mock parties data
const mockParties: Party[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    color: '#1DB954',
    hasConfirmed: false,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    color: '#FF6B6B',
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
      <div className="container mx-auto max-w-5xl px-6 py-8">
        {/* Status Banner */}
        {waitingForOthers && (
          <Card className="bg-primary/5 border-primary/20 mb-6 p-6">
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
          <Card className="bg-primary/10 border-primary/30 mb-6 p-6">
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

        {/* Document Preview */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-muted/30 p-8">
            <div className="bg-background mx-auto max-w-3xl rounded-lg p-12 shadow-lg">
              <div className="text-foreground/90 space-y-6">
                <div className="border-border border-b pb-6 text-center">
                  <h1 className="mb-2 text-3xl font-bold">
                    Partnership Agreement
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Effective Date: January 15, 2025
                  </p>
                </div>

                <section>
                  <h2 className="mb-3 text-xl font-semibold">Preamble</h2>
                  <p className="text-sm leading-relaxed">
                    This Partnership Agreement (&quot;Agreement&quot;) is
                    entered into as of the date set forth above by and between
                    the parties identified below, who agree to the terms and
                    conditions set forth herein.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-xl font-semibold">Definitions</h2>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Party A:</strong> John Doe, representing ABC
                      Corporation
                    </p>
                    <p>
                      <strong>Party B:</strong> Jane Smith, representing XYZ
                      Enterprises
                    </p>
                    <p>
                      <strong>Effective Date:</strong> The date on which this
                      Agreement becomes binding
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 text-xl font-semibold">
                    Terms and Conditions
                  </h2>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h3 className="mb-2 font-semibold">
                        1. Scope of Agreement
                      </h3>
                      <p className="leading-relaxed">
                        The parties agree to collaborate on the development and
                        marketing of innovative software solutions for
                        enterprise clients.
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold">2. Obligations</h3>
                      <p className="leading-relaxed">
                        Each party shall contribute resources, expertise, and
                        personnel as outlined in Schedule A attached hereto.
                      </p>
                    </div>
                    <div>
                      <h3 className="mb-2 font-semibold">3. Payment Terms</h3>
                      <p className="leading-relaxed">
                        Revenue shall be distributed according to the percentage
                        ownership outlined in Section 4.2 of this Agreement.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 text-xl font-semibold">Signatures</h2>
                  <div className="mt-6 grid grid-cols-2 gap-8">
                    {parties.map((party) => (
                      <div
                        key={party.id}
                        className="border-border border-t pt-4"
                      >
                        <p className="text-sm font-semibold">{party.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {party.email}
                        </p>
                        {party.hasConfirmed && (
                          <div className="text-primary mt-2 flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            <span className="text-xs font-medium">
                              Confirmed
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        {!currentUserConfirmed && (
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleCancel}
              className="min-w-32 bg-transparent"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button size="lg" onClick={handleConfirm} className="min-w-32">
              <Check className="mr-2 h-4 w-4" />
              Confirm Agreement
            </Button>
          </div>
        )}

        {/* Party Status */}
        <Card className="mt-6 p-6">
          <h3 className="mb-4 font-semibold">Confirmation Status</h3>
          <div className="space-y-3">
            {parties.map((party) => (
              <div key={party.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback style={{ backgroundColor: party.color }}>
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
                  <span className="text-muted-foreground text-sm">Pending</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
