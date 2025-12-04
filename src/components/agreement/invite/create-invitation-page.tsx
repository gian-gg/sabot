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
import { toast } from 'sonner';
import { AgreementStatusResponse } from '@/types/agreement';

export function CreateInvitationPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);

  const agreementLink = agreementId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/agreement/accept?id=${agreementId}`
    : '';

  // Initialize agreement creation
  useEffect(() => {
    const createAgreement = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/agreement/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New Agreement',
            agreement_type: 'Custom',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          toast.error(error.error || 'Failed to create agreement');
          router.push('/home');
          return;
        }

        const data = await response.json();
        setAgreementId(data.agreement.id);
        setIsWaiting(true);
      } catch (error) {
        console.error('Error creating agreement:', error);
        toast.error('Failed to create agreement');
        router.push('/home');
      } finally {
        setLoading(false);
      }
    };

    createAgreement();
  }, [router]);

  // Poll for participant join
  useEffect(() => {
    if (!isWaiting || !agreementId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/agreement/${agreementId}/status`);
        if (!response.ok) return;

        const data: AgreementStatusResponse = await response.json();

        // Check if both parties have joined
        if (data.is_ready_for_next_step) {
          setIsWaiting(false);
          toast.success('Other party has joined!');
          // Navigate to configure step
          router.push(`/agreement/configure?id=${agreementId}`);
        }
      } catch (error) {
        console.error('Error polling agreement status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [isWaiting, agreementId, router]);

  const handleSendInvitation = async () => {
    if (!email) return;
    setSending(true);
    try {
      // TODO: Implement email sending via backend
      console.log('Sending invitation to:', email);
      toast.success(`Invitation sent to ${email}`);
      setDialogOpen(false);
      setEmail('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(agreementLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      toast.success('Link copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center p-4 pt-18">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Creating agreement...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Button
                onClick={handleCopy}
                variant="outline"
                size="icon"
                disabled={!agreementLink}
              >
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
