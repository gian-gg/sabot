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
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { toast } from 'sonner';
import { ROUTES } from '@/constants/routes';

export function CreateTransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionLink, setTransactionLink] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createInProgressRef = useRef(false);

  const { status } = useTransactionStatus(transactionId);

  // Check for existing transaction ID in URL first, then create if needed
  useEffect(() => {
    // Prevent duplicate creation requests during strict mode
    if (createInProgressRef.current) {
      return;
    }

    const existingId = searchParams.get('id');
    if (existingId) {
      console.log('Reusing existing transaction ID:', existingId);
      setTransactionId(existingId);
      setTransactionLink(
        `${window.location.origin}/transaction/accept?id=${existingId}`
      );
      toast.info('Resumed existing transaction');
      return;
    }

    createInProgressRef.current = true;

    const createTransaction = async () => {
      try {
        const response = await fetch('/api/transaction/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          let errorData: ErrorResponse = { error: 'Unknown error' };
          try {
            errorData = await response.json();
          } catch {
            console.warn('Failed to parse error response as JSON');
            errorData = { error: response.statusText || 'Unknown error' };
          }

          console.error('Transaction creation failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });

          // Handle authentication error specifically
          if (response.status === 401) {
            setError('authentication');
            toast.error('Please sign in to create a transaction');
            setTimeout(() => router.push('/sign-in'), 2000);
            return;
          }

          // Handle transaction limit exceeded (409 Conflict)
          if (response.status === 409) {
            const code = errorData?.code;
            if (code === 'MAX_PENDING_EXCEEDED') {
              setError('limit_pending');
              toast.error(
                `You have ${errorData.currentCount}/${errorData.maxLimit} pending transactions. Delete or complete some to create new ones.`,
                { duration: 6000 }
              );
              return;
            }
            if (code === 'MAX_ACTIVE_EXCEEDED') {
              setError('limit_active');
              toast.error(
                `You have ${errorData.currentCount}/${errorData.maxLimit} active transactions. Complete or cancel some to create new ones.`,
                { duration: 6000 }
              );
              return;
            }
            // Generic 409 conflict
            setError('conflict');
            toast.error(
              errorData?.error || 'Cannot create transaction at this time'
            );
            return;
          }

          // Handle database/migration errors
          if (response.status === 500) {
            setError('database');
            toast.error(
              'Database setup required. Please run migrations first.'
            );
            console.error(
              'Hint: Run database migrations in Supabase Dashboard'
            );
            return;
          }

          // Generic error
          setError('generic');
          toast.error(errorData?.error || 'Failed to create transaction');
          return;
        }

        const data = await response.json();
        setTransactionId(data.transaction.id);
        setTransactionLink(data.invite_url);

        // Update URL with transaction ID to prevent duplicate creation on refresh
        window.history.replaceState(
          null,
          '',
          `/transaction/invite?id=${data.transaction.id}`
        );

        toast.success('Transaction created successfully');
      } catch (error) {
        console.error('Error creating transaction:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create transaction';
        setError('generic');
        toast.error(errorMessage);
      } finally {
        createInProgressRef.current = false;
      }
    };

    createTransaction();
  }, [router, searchParams]);

  // Navigate to configure transaction when both users join
  useEffect(() => {
    console.log('Creator - Status check:', {
      status: status?.transaction.status,
      participantCount: status?.participants.length,
      isReady: status?.is_ready_for_next_step,
    });

    if (
      status?.is_ready_for_next_step &&
      status.transaction.status === 'both_joined'
    ) {
      console.log(
        'Creator - Both joined! Navigating to configure transaction...'
      );
      toast.success(
        "Other party has joined! Let's configure the transaction together..."
      );
      setTimeout(() => {
        router.push(`${ROUTES.TRANSACTION.UPLOAD}?id=${transactionId}`);
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

  // Show error state if transaction creation failed
  if (error && !transactionId) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center p-4">
        <Card className="border-destructive/50 w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-destructive text-xl">
              {error === 'authentication' && 'Authentication Required'}
              {error === 'database' && 'Database Setup Required'}
              {error === 'limit_pending' &&
                'Pending Transactions Limit Reached'}
              {error === 'limit_active' && 'Active Transactions Limit Reached'}
              {error === 'conflict' && 'Cannot Create Transaction'}
              {error === 'generic' && 'Error Creating Transaction'}
            </CardTitle>
            <CardDescription>
              {error === 'authentication' && 'Redirecting to sign in...'}
              {error === 'database' && 'Database migrations need to be run'}
              {error === 'limit_pending' &&
                'You have reached the maximum of 5 pending transactions. Please complete or delete some to create new ones.'}
              {error === 'limit_active' &&
                'You have reached the maximum of 3 active transactions. Please complete or cancel some to create new ones.'}
              {error === 'conflict' &&
                'A conflict occurred while creating your transaction'}
              {error === 'generic' && 'An unexpected error occurred'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error === 'database' && (
              <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                <p className="text-sm text-amber-600">
                  <strong>Setup Required:</strong> Please run the database
                  migrations:
                </p>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-amber-600">
                  <li>Open Supabase Dashboard → SQL Editor</li>
                  <li>Run migration files from supabase/migrations/</li>
                  <li>Refresh this page</li>
                </ol>
                <p className="mt-2 text-xs text-amber-600/80">
                  See docs/QUICK_START.md for detailed instructions
                </p>
              </div>
            )}
            <div className="flex gap-2">
              {error !== 'authentication' && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
                >
                  Retry
                </Button>
              )}
              <Button onClick={() => router.push('/user')} variant="outline">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while creating transaction
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
              <p className="text-sm text-amber-600">
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
