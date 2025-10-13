'use client';

import { useState } from 'react';
import { Copy, Loader2, Mail, SendHorizontal, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewTransactionPage() {
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const transactionLink = 'http://localhost:3000/transaction/invite/abc123';

  const handleSendInvitation = async () => {
    if (!email) return;
    setSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1200));
    console.log('Sending invitation to:', email);
    setSending(false);
    setOpen(false);
    setEmail('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transactionLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      // Optionally handle error
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Create New Transaction</CardTitle>
          <CardDescription>
            Generate a secure transaction link to share with your counterparty.
            Both parties must be verified to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border-border bg-muted/50 rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Your Transaction Link</h3>
            <p className="text-muted-foreground mb-3 text-sm">
              Share this link with your counterparty on any platform (Facebook
              Marketplace, Carousell, etc.)
            </p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={transactionLink}
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label="Copy transaction link"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Send Email Invitation</DialogTitle>
                    <DialogDescription>
                      Enter your counterparty&apos;s email address to send them
                      a secure transaction invitation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative w-full">
                        <Input
                          id="email"
                          type="email"
                          placeholder="buyer@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !sending) {
                              handleSendInvitation();
                            }
                          }}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          disabled={sending || !email}
                          onClick={handleSendInvitation}
                          className="hover:bg-accent absolute top-1/2 right-1 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
                        >
                          {sending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <SendHorizontal className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="justify-cente flex items-center">
            <Button disabled size="lg" className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Waiting for other party...
            </Button>
          </div>

          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              <strong>Important:</strong> Both you and your counterparty must be
              verified users to proceed with the transaction. Unverified users
              will be prompted to complete identity verification.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
