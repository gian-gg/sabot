'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getAgreementById } from '@/lib/mock-data/agreements';
// TODO: Import Button, Card, Avatar components from shadcn/ui
// TODO: Apply Spotify green theme (#1DB954) instead of blue

export default function FinalizeAgreementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const agreement = getAgreementById(id);
  const [currentUserConfirmed, setCurrentUserConfirmed] = useState(false);
  const [parties, setParties] = useState(agreement?.parties || []);

  const currentUserId = '1'; // Mock current user

  if (!agreement) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div>
          <p>Agreement not found</p>
          <Link href={ROUTES.HOME.ROOT}>Go Home</Link>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    setCurrentUserConfirmed(true);
    setParties(
      parties.map((party) =>
        party.id === currentUserId ? { ...party, hasConfirmed: true } : party
      )
    );

    // Mock other party confirming after 3 seconds
    setTimeout(() => {
      setParties((prev) =>
        prev.map((party) => ({ ...party, hasConfirmed: true }))
      );
    }, 3000);
  };

  const handleCancel = () => {
    router.push(ROUTES.AGREEMENT.ACTIVE(id));
  };

  const allConfirmed = parties.every((party) => party.hasConfirmed);
  const waitingForOthers = currentUserConfirmed && !allConfirmed;

  return (
    <div className="bg-background min-h-screen">
      {/* TODO: Replace with v0-generated header with Spotify green theme */}
      <header className="border-border/50 bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href={ROUTES.AGREEMENT.ACTIVE(id)}>
              <span>← Back to Editor</span>
            </Link>
            <div className="bg-border h-6 w-px" />
            <h1>
              Finalize <span className="text-primary">Agreement</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {parties.map((party) => (
              <div key={party.id} className="flex items-center gap-2">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: party.color,
                    border: party.hasConfirmed
                      ? '2px solid #1DB954'
                      : '2px solid gray',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                  }}
                >
                  {party.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                {party.hasConfirmed && <span>✓</span>}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-6 py-8">
        {/* Status Banners */}
        {waitingForOthers && (
          <div className="border-primary/20 bg-primary/5 mb-6 rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <span className="animate-spin">⟳</span>
              <div>
                <h3 className="font-semibold">
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
          </div>
        )}

        {allConfirmed && (
          <div className="border-primary/30 bg-primary/10 mb-6 rounded-lg border p-6">
            <div className="flex items-center gap-3">
              <span>✓</span>
              <div>
                <h3 className="font-semibold">Agreement Finalized!</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  All parties have confirmed. The agreement is now locked and
                  ready for download.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Document Preview */}
        <div className="mb-6 overflow-hidden rounded-lg border">
          <div className="bg-muted/30 p-8">
            <div className="bg-background mx-auto max-w-3xl rounded-lg p-12 shadow-lg">
              <div className="text-foreground/90 space-y-6">
                {/* TODO: Replace with actual agreement content from sections */}
                <div className="border-border border-b pb-6 text-center">
                  <h1 className="mb-2 text-3xl font-bold">{agreement.title}</h1>
                  <p className="text-muted-foreground text-sm">
                    Effective Date: {agreement.effectiveDate}
                  </p>
                </div>

                <section>
                  <h2 className="mb-3 text-xl font-semibold">Preamble</h2>
                  <p className="text-sm leading-relaxed">
                    This agreement is entered into as of the date set forth
                    above by and between the parties identified below.
                  </p>
                </section>

                <section>
                  <h2 className="mb-3 text-xl font-semibold">Parties</h2>
                  <div className="space-y-2 text-sm">
                    {parties.map((party, index) => (
                      <p key={party.id}>
                        <strong>
                          Party {String.fromCharCode(65 + index)}:
                        </strong>{' '}
                        {party.name}, {party.email}
                      </p>
                    ))}
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
                            <span>✓</span>
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
        </div>

        {/* Action Buttons */}
        {!currentUserConfirmed && (
          <div className="flex items-center justify-center gap-4">
            <button onClick={handleCancel} className="min-w-32">
              ✕ Cancel
            </button>
            <button onClick={handleConfirm} className="min-w-32">
              ✓ Confirm Agreement
            </button>
          </div>
        )}

        {/* Party Status */}
        <div className="mt-6 rounded-lg border p-6">
          <h3 className="mb-4 font-semibold">Confirmation Status</h3>
          <div className="space-y-3">
            {parties.map((party) => (
              <div key={party.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: party.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                    }}
                  >
                    {party.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{party.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {party.email}
                    </p>
                  </div>
                </div>
                {party.hasConfirmed ? (
                  <div className="text-primary flex items-center gap-2">
                    <span>✓</span>
                    <span className="text-sm font-medium">Confirmed</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Pending</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
