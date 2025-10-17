'use client';

import { useState } from 'react';
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

export function CreateInvitationPage() {
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const agreementId = 'abc123';
  const agreementLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/agreement/invite?id=${agreementId}`;

  const handleSendInvitation = async () => {
    if (!email) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    console.log('[v0] Sending invitation to:', email);
    setSending(false);
    setDialogOpen(false);
    setEmail('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(agreementLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error('[v0] Failed to copy:', error);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center p-4 pt-18">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Create New Agreement</CardTitle>
          <CardDescription>
            Generate a secure agreement link to share with your counterparty.
            Both parties must be verified to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Shareable Agreement Link</Label>
            <div className="flex gap-2">
              <Input
                value={agreementLink}
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
                    Enter the email address of the person you want to invite to
                    this agreement.
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

          <div className="flex items-center justify-center">
            <Button disabled size="lg" className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Waiting for other party...
            </Button>
          </div>

          <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              <strong>Important:</strong> Both you and your counterparty must be
              verified users to proceed with the agreement. Unverified users
              will be prompted to complete identity verification.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
