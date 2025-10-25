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
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `HTTP ${response.status}: Failed to fetch transaction status`
          );
        }
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        console.error('Transaction status fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Subscribe to Supabase Broadcast channel (works without database replication)
    const channel = supabase
      .channel(`transaction:${transactionId}`)
      .on('broadcast', { event: 'transaction_update' }, () => {
        // console.log('Received broadcast:', payload);
        // Refetch status when broadcast received
        fetchStatus();
      })
      .on('broadcast', { event: 'deliverable_confirmed' }, (payload) => {
        console.log('Deliverable confirmed via AI verification:', payload);
        console.log('Refetching transaction status...');
        // Refetch status when deliverable is confirmed
        fetchStatus();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // console.log('Subscribed to transaction updates');
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

  return { status, setStatus, loading, error, refresh: () => setLoading(true) };
}
