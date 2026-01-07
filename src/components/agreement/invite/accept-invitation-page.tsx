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
import { ReviewAgreementInvitation } from '@/components/agreement/invite/review-invitation';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AcceptAgreementPageProps {
  agreementId: string;
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

export function AcceptAgreementPage({ agreementId }: AcceptAgreementPageProps) {
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

        // Fetch agreement details
        const response = await fetch(`/api/agreement/${agreementId}/status`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Agreement fetch failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });

          if (response.status === 401) {
            throw new Error('Please sign in to view this agreement');
          } else if (response.status === 404) {
            throw new Error('Agreement not found');
          } else {
            throw new Error(
              errorData.error || 'Failed to fetch agreement details'
            );
          }
        }

        const data = await response.json();
        console.log('📋 Agreement data received:', data);

        // Check if current user is the creator (self-invite)
        if (user && user.id === data.agreement.creator_id) {
          setIsSelfInvite(true);
          return;
        }

        // Set inviter data from stored agreement fields
        setInviter({
          id: data.agreement.creator_id,
          name: data.agreement.creator_name || 'User',
          email: data.agreement.creator_email || '',
          avatar: data.agreement.creator_avatar_url,
          trustScore: 85, // Default for now
          isVerified: true,
          completedTransactions: 0,
        });

        console.log('✅ Inviter state set:', {
          id: data.agreement.creator_id,
          name: data.agreement.creator_name || 'User',
          email: data.agreement.creator_email || '',
          avatar: data.agreement.creator_avatar_url,
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
  }, [agreementId]);

  const handleAcceptInvite = async () => {
    if (accepting) return; // Prevent double-click

    try {
      setAccepting(true);

      const response = await fetch('/api/agreement/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreement_id: agreementId }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));

        // Handle specific errors
        if (errorData.error?.includes('already joined')) {
          toast.info('You have already joined this agreement');
          // Still redirect them to the agreement
          setTimeout(() => {
            router.push(`/agreement/configure?id=${agreementId}`);
          }, 800);
          return;
        }

        if (
          errorData.error?.includes('cannot accept your own') ||
          errorData.error?.includes('own invitation')
        ) {
          toast.error('You cannot accept your own invitation link');
          setTimeout(() => {
            router.push(ROUTES.HOME.ROOT);
          }, 1500);
          return;
        }

        throw new Error(errorData.error || 'Failed to join agreement');
      }

      const data = await response.json();

      if (data.already_joined) {
        toast.info('You have already joined this agreement');
      } else {
        toast.success('Successfully joined agreement!');
      }

      // Redirect to configure page
      setTimeout(() => {
        router.push(`/agreement/configure?id=${agreementId}`);
      }, 800);
    } catch (error) {
      console.error('Error joining agreement:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to join agreement'
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
                This is your own agreement invitation link. You cannot join an
                agreement that you created. Please share this link with the
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
            You&apos;ve been invited to a verified agreement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReviewAgreementInvitation
            inviter={inviter}
            onAccept={handleAcceptInvite}
            onDecline={handleDecline}
            loading={accepting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
