'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROUTES } from '@/constants/routes';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { ReviewTransactionInvitation } from '@/components/transaction/invite/review-invitation';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AcceptTransactionPageProps {
  transactionId: string;
}

interface Inviter {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  trustScore: number;
  isVerified: boolean;
  completedTransactions: number;
}

export function AcceptTransactionPage({
  transactionId,
}: AcceptTransactionPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [inviter, setInviter] = useState<Inviter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSelfInvite, setIsSelfInvite] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const fetchInviterData = async () => {
      try {
        setLoading(true);

        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Fetch transaction details
        const response = await fetch(`/api/transaction/${transactionId}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Transaction fetch failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });

          if (response.status === 401) {
            throw new Error('Please sign in to view this transaction');
          } else if (response.status === 404) {
            throw new Error('Transaction not found');
          } else {
            throw new Error(
              errorData.error || 'Failed to fetch transaction details'
            );
          }
        }

        const data = await response.json();
        console.log('📊 Transaction data received:', data);

        // Check if current user is the creator (self-invite)
        if (user && user.id === data.creator_id) {
          setIsSelfInvite(true);
          return;
        }

        // Set inviter data from stored transaction fields
        setInviter({
          id: data.creator_id,
          name: data.creator_name || 'User',
          email: data.creator_email || '',
          avatar: data.creator_avatar_url,
          trustScore: 85, // Default for now
          isVerified: true,
          completedTransactions: 0,
        });

        console.log('✅ Inviter state set:', {
          id: data.creator_id,
          name: data.creator_name || 'User',
          email: data.creator_email || '',
          avatar: data.creator_avatar_url,
          isVerified: true,
          completedTransactions: 0,
        });
      } catch (err) {
        console.error('Error fetching inviter data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load invitation'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInviterData();
  }, [transactionId]);

  const handleAcceptInvite = async () => {
    if (accepting) return; // Prevent double-click

    try {
      setAccepting(true);

      const response = await fetch('/api/transaction/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));

        // Handle specific errors
        if (errorData.error?.includes('already joined')) {
          toast.info('You have already joined this transaction');
          // Still redirect them to the transaction
          setTimeout(() => {
            router.push(`${ROUTES.TRANSACTION.UPLOAD}?id=${transactionId}`);
          }, 800);
          return;
        }

        if (
          errorData.error?.includes('cannot accept your own') ||
          errorData.error?.includes('own invitation')
        ) {
          toast.error('You cannot accept your own invitation link');
          setTimeout(() => {
            router.push(ROUTES.ROOT);
          }, 1500);
          return;
        }

        throw new Error(errorData.error || 'Failed to join transaction');
      }

      const data = await response.json();

      if (data.already_joined) {
        toast.info('You have already joined this transaction');
      } else {
        toast.success('Successfully joined transaction!');
      }

      // Redirect to upload screenshot page
      setTimeout(() => {
        router.push(`${ROUTES.TRANSACTION.UPLOAD}?id=${transactionId}`);
      }, 800);
    } catch (error) {
      console.error('Error joining transaction:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to join transaction'
      );
      setAccepting(false); // Re-enable button on error
    }
  };

  const handleDecline = () => {
    router.push(ROUTES.HOME.ROOT);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
            <p className="text-muted-foreground">
              Loading invitation details...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show self-invite error
  if (isSelfInvite) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Invalid Invitation</CardTitle>
            <CardDescription>
              You cannot accept your own invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Self-Invitation Not Allowed</AlertTitle>
              <AlertDescription>
                This is your own transaction invitation link. You cannot join a
                transaction that you created. Please share this link with the
                other party instead.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push(ROUTES.HOME.ROOT)}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error || !inviter) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Error</CardTitle>
            <CardDescription>Failed to load invitation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error ||
                  'Unable to load invitation details. Please try again.'}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => router.push(ROUTES.HOME.ROOT)}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Agreement Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to a verified transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewTransactionInvitation
            inviter={inviter}
            onAccept={handleAcceptInvite}
            onDecline={handleDecline}
            accepting={accepting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
