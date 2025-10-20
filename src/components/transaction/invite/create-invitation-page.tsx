'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Copy, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { toast } from 'sonner';
import { ROUTES } from '@/constants/routes';

export function CreateTransactionPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionLink, setTransactionLink] = useState('');

  const { status } = useTransactionStatus(transactionId);

  // Create transaction on mount
  useEffect(() => {
    const createTransaction = async () => {
      try {
        const response = await fetch('/api/transaction/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error('Failed to create transaction');
        }

        const data = await response.json();
        setTransactionId(data.transaction.id);
        setTransactionLink(data.invite_url);
        toast.success('Transaction created successfully');
      } catch (error) {
        console.error('Error creating transaction:', error);
        toast.error('Failed to create transaction');
      }
    };

    createTransaction();
  }, []);

  // Navigate to screenshot upload when both users join
  useEffect(() => {
    if (
      status?.is_ready_for_next_step &&
      status.transaction.status === 'both_joined'
    ) {
      toast.success(
        'Other party has joined! Proceeding to screenshot upload...'
      );
      setTimeout(() => {
        router.push(`${ROUTES.TRANSACTION.VIEW(transactionId!)}`);
      }, 1500);
    }
  }, [status, transactionId, router]);

  const handleSendInvitation = async () => {
    if (!email) return;
    setSending(true);
    // TODO: Integrate with email service (Resend/SendGrid)
    await new Promise((r) => setTimeout(r, 1200));
    console.log('Sending invitation to:', email);
    toast.success(`Invitation sent to ${email}`);
    setSending(false);
    setDialogOpen(false);
    setEmail('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transactionLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (!transactionId) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
              <p className="text-muted-foreground mt-4 text-sm">
                Creating transaction...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const participantCount = status?.participants.length || 1;
  const isWaitingForParticipant = participantCount < 2;

  return (
    <div className="flex min-h-screen w-screen items-center justify-center p-4 pt-18">
      <div>
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Create New Transaction</CardTitle>
            <CardDescription>
              Generate a secure transaction link to share with your
              counterparty. Both parties must be verified to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Shareable Transaction Link</Label>
              <div className="flex gap-2">
                <Input
                  value={transactionLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopy} variant="outline" size="icon">
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Mail className="mr-2 h-4 w-4" />
                    Send via Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Invitation</DialogTitle>
                    <DialogDescription>
                      Enter the email address of the person you want to invite
                      to this transaction.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleSendInvitation}
                      disabled={!email || sending}
                      className="w-full"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Invitation'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="justify-cente flex items-center">
              <Button
                disabled={isWaitingForParticipant}
                size="lg"
                className="w-full"
              >
                {isWaitingForParticipant ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Waiting for other party...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Both parties joined!
                  </>
                )}
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
