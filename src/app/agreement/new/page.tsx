'use client';

import { useState } from 'react';
import AgreementLink from '@/components/agreement/new/agreement-link';
// TODO: Import EmailInvitationDialog when ready (reuse from transaction)
// TODO: Import Button, Card components from shadcn/ui

const AGREEMENT_LINK = 'http://localhost:3000/agreement/invite/xyz789';

export default function NewAgreementPage() {
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSendInvitation = async () => {
    if (!email) return;
    setSending(true);
    // Mock sending delay
    await new Promise((r) => setTimeout(r, 1200));
    console.log('Sending invitation to:', email);
    setSending(false);
    setDialogOpen(false);
    setEmail('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(AGREEMENT_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openDialog = () => setDialogOpen(true);

  return (
    <div className="flex min-h-screen w-screen items-center justify-center p-4 pt-14">
      {/* TODO: Replace with v0-generated UI */}
      <div className="w-full max-w-2xl">
        <h1>Create New Agreement</h1>
        <p>Generate a secure agreement link to share with your counterparty.</p>

        <AgreementLink
          link={AGREEMENT_LINK}
          onCopy={handleCopy}
          copied={copied}
          onOpenDialog={openDialog}
        />

        {/* TODO: Add EmailInvitationDialog component */}
        {dialogOpen && (
          <div>
            <p>Email Dialog Placeholder</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
            <button onClick={handleSendInvitation} disabled={sending}>
              {sending ? 'Sending...' : 'Send'}
            </button>
            <button onClick={() => setDialogOpen(false)}>Close</button>
          </div>
        )}

        {/* Waiting state */}
        <div>
          <button disabled>Waiting for other party...</button>
        </div>

        {/* Warning banner */}
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
          <p>
            <strong>Important:</strong> Both you and your counterparty must be
            verified users to proceed with the agreement.
          </p>
        </div>
      </div>
    </div>
  );
}
