'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Copy, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorResponse {
  error: string;
  code?: string;
  currentCount?: number;
  maxLimit?: number;
}

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
import { useAgreementStatus } from '@/hooks/useAgreementStatus';
import { toast } from 'sonner';
import { sendAgreementInviteWithCurrentUser } from '@/lib/email/agreements';

export function CreateInvitationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [agreementId, setAgreementId] = useState<string | null>(null);
  const [agreementLink, setAgreementLink] = useState('');
  const createInProgressRef = useRef(false);

  const { status } = useAgreementStatus(agreementId);

  // Navigate to configure agreement when both users join
  useEffect(() => {
    console.log('Creator - Status check:', {
      status: status?.agreement.status,
      participantCount: status?.participants.length,
      isReady: status?.is_ready_for_next_step,
    });

    if (status?.is_ready_for_next_step) {
      console.log(
        'Creator - Both joined! Navigating to configure agreement...'
      );
      toast.success(
        "Other party has joined! Let's configure the agreement together..."
      );
      setTimeout(() => {
        router.push(`/agreement/configure?id=${agreementId}`);
      }, 1500);
    }
  }, [status, agreementId, router]);

  // Check for existing agreement ID in URL first, then create if needed
  useEffect(() => {
    // Prevent duplicate creation requests during strict mode
    if (createInProgressRef.current) {
      return;
    }

    const existingId = searchParams.get('id');
    if (existingId) {
      console.log('Reusing existing agreement ID:', existingId);
      setAgreementId(existingId);
      setAgreementLink(
        `${window.location.origin}/agreement/accept?id=${existingId}`
      );
      toast.info('Resumed existing agreement');
      return;
    }

    createInProgressRef.current = true;

    const createAgreement = async () => {
      try {
        const response = await fetch('/api/agreement/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New Agreement',
            agreement_type: 'Custom',
          }),
        });

        if (!response.ok) {
          let errorData: ErrorResponse = { error: 'Unknown error' };
          try {
            errorData = await response.json();
          } catch {
            console.warn('Failed to parse error response as JSON');
            errorData = { error: response.statusText || 'Unknown error' };
          }

          console.error('Agreement creation failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });

          // Handle authentication error specifically
          if (response.status === 401) {
            toast.error('Please sign in to create an agreement');
            setTimeout(() => router.push('/sign-in'), 2000);
            return;
          }

          // Handle agreement limit exceeded (429 Too Many Requests)
          if (response.status === 429) {
            const code = errorData?.code;
            if (code === 'MAX_WAITING_EXCEEDED') {
              toast.error(
                `You have ${errorData.currentCount}/${errorData.maxLimit} waiting agreements. Complete some to create new ones.`,
                { duration: 6000 }
              );
              return;
            }
            if (code === 'MAX_IN_PROGRESS_EXCEEDED') {
              toast.error(
                `You have ${errorData.currentCount}/${errorData.maxLimit} in-progress agreements. Finalize some to create new ones.`,
                { duration: 6000 }
              );
              return;
            }
            // Generic 429 conflict
            toast.error(
              errorData?.error || 'Cannot create agreement at this time'
            );
            return;
          }

          // Handle generic errors
          toast.error(errorData?.error || 'Failed to create agreement');
          return;
        }

        const data = await response.json();
        setAgreementId(data.agreement.id);
        setAgreementLink(
          `${window.location.origin}/agreement/accept?id=${data.agreement.id}`
        );
        console.log('✅ Agreement created:', data.agreement.id);
      } catch (err) {
        console.error('Error creating agreement:', err);
        toast.error('Failed to create agreement');
      } finally {
        createInProgressRef.current = false;
      }
    };

    createAgreement();
  }, [router, searchParams]);

  const handleSendInvitation = async () => {
    if (!email) return;
    setSending(true);

    try {
      // Send the agreement invite email (server action handles getting current user)
      const result = await sendAgreementInviteWithCurrentUser(
        email,
        agreementLink
      );

      if (result.success) {
        toast.success(`Invitation sent to ${email}`);
        setDialogOpen(false);
        setEmail('');
      } else {
        toast.error(
          result.error || 'Failed to send invitation. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation. Please try again.');
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
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  };

  // Show loading state while creating agreement
  if (!agreementId) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
              <p className="text-muted-foreground mt-4 text-sm">
                Creating agreement...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isWaitingForParticipant = !status?.is_ready_for_next_step;

  return (
    <div className="flex min-h-screen w-screen items-center justify-center p-4 pt-18">
      <div>
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
                      Enter the email address of the person you want to invite
                      to this agreement.
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
              <p className="text-sm text-amber-600">
                <strong>Important:</strong> Both you and your counterparty must
                be verified users to proceed with the agreement. Unverified
                users will be prompted to complete identity verification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
