'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import TransactionLinkSection from '@/components/transaction-link';
import EmailInvitationDialog from '@/components/email-invitation';

const TRANSACTION_LINK = 'http://localhost:3000/transaction/invite/abc123';

export default function NewTransactionPage() {
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSendInvitation = async () => {
    if (!email) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    console.log('Sending invitation to:', email);
    setSending(false);
    setDialogOpen(false);
    setEmail('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(TRANSACTION_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Optionally handle error
    }
  };

  const openDialog = () => setDialogOpen(true);

  return (
    <div className="flex min-h-screen w-screen items-center justify-center p-4 pt-14">
      <div>
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Transaction</CardTitle>
            <CardDescription>
              Generate a secure transaction link to share with your
              counterparty. Both parties must be verified to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <TransactionLinkSection
              link={TRANSACTION_LINK}
              onCopy={handleCopy}
              copied={copied}
              onOpenDialog={openDialog}
            />
            <EmailInvitationDialog
              open={dialogOpen}
              setOpen={setDialogOpen}
              email={email}
              setEmail={setEmail}
              sending={sending}
              handleSendInvitation={handleSendInvitation}
            />
            <div className="justify-cente flex items-center">
              <Button disabled size="lg" className="w-full">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Waiting for other party...
              </Button>
            </div>
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                <strong>Important:</strong> Both you and your counterparty must
                be verified users to proceed with the transaction. Unverified
                users will be prompted to complete identity verification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
