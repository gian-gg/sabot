'use client';

import { Suspense, useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { CreateTransactionForm } from '@/components/transaction/invite/create-transaction-form';
import { Loader2 } from 'lucide-react';
import { useSharedConflictResolution } from '@/hooks/use-shared-conflict-resolution';
import { createClient } from '@/lib/supabase/client';

function TransactionNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authUserName, setAuthUserName] = useState<string>('Loading...');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Try to get transactionId from path params first, then search params
  const transactionId = (params.id as string) || searchParams.get('id');

  // Fetch authenticated user data
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setAuthUserId(user.id);

        // Get user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', user.id)
          .single();

        if (profile) {
          setAuthUserName(
            profile.full_name || profile.username || user.email || 'User'
          );
        } else {
          setAuthUserName(user.email || 'User');
        }
      }

      setIsLoadingAuth(false);
    };

    fetchUser();
  }, []);

  // Generate stable user ID for this specific tab/window (NOT shared across tabs)
  const tabUserId = useMemo(() => {
    // Use sessionStorage instead of localStorage - unique per tab
    if (typeof window !== 'undefined') {
      let storedTabId = sessionStorage.getItem('tab_user_id');

      if (!storedTabId) {
        storedTabId = 'tab-' + Math.random().toString(36).slice(2, 9);
        sessionStorage.setItem('tab_user_id', storedTabId);
      }

      return storedTabId;
    }

    return 'tab-' + Math.random().toString(36).slice(2, 9);
  }, []);

  // Use authenticated user ID if available, otherwise use tab-specific ID
  const userId = authUserId || tabUserId;
  const userName = authUserName;

  // Establish WebSocket connection at page level - persists across step navigation
  // Pass empty string if still loading to prevent connection with wrong user ID
  const conflictResolution = useSharedConflictResolution(
    transactionId || 'temp',
    isLoadingAuth ? '' : userId, // Only use real userId after auth loads
    isLoadingAuth ? 'Loading...' : userName
  );

  const handleTransactionCreated = (id: string) => {
    // Redirect to invitation created view (only for new transactions)
    router.push(`/transaction/invite?created=${id}`);
  };

  if (!transactionId) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center">
        <div className="text-muted-foreground text-center">
          No transaction ID provided
        </div>
      </div>
    );
  }

  // Show loading while fetching auth to prevent duplicate WebSocket connections with different user IDs
  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <CreateTransactionForm
      transactionId={transactionId}
      onTransactionCreated={handleTransactionCreated}
      conflictResolution={conflictResolution}
      userId={userId}
      userName={userName}
    />
  );
}

export default function TransactionNewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-screen items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <TransactionNewContent />
    </Suspense>
  );
}
