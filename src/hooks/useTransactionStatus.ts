'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TransactionStatusResponse } from '@/types/transaction';

const POLL_INTERVAL = 5000; // Poll every 5 seconds as fallback

export function useTransactionStatus(transactionId: string | null) {
  const [status, setStatus] = useState<TransactionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // create supabase client inside effect so it's not a dependency
    const supabase = createClient();

    if (!transactionId) {
      setLoading(false);
      return;
    }

    // Fetch initial status
    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `/api/transaction/${transactionId}/status`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch transaction status');
        }
        const data = await response.json();
        console.log('Hook - Status fetched:', {
          status: data.transaction?.status,
          participantCount: data.participants?.length,
          isReady: data.is_ready_for_next_step,
        });
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Subscribe to Supabase Broadcast channel (works without database replication)
    const channel = supabase
      .channel(`transaction:${transactionId}`)
      .on('broadcast', { event: 'transaction_update' }, (payload) => {
        console.log('Received broadcast:', payload);
        // Refetch status when broadcast received
        fetchStatus();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to transaction updates');
        }
      });

    // Fallback: Poll for updates every 5 seconds
    // This ensures updates even if broadcast fails or is delayed
    pollIntervalRef.current = setInterval(() => {
      fetchStatus();
    }, POLL_INTERVAL);

    return () => {
      // Cleanup
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      // removeChannel on the same client instance created above
      supabase.removeChannel(channel);
    };
  }, [transactionId]);

  return { status, loading, error, refresh: () => setLoading(true) };
}
