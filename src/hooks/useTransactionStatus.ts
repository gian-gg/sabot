'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TransactionStatusResponse } from '@/types/transaction';

export function useTransactionStatus(transactionId: string | null) {
  const [status, setStatus] = useState<TransactionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
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
        setStatus(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`transaction-${transactionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `id=eq.${transactionId}`,
        },
        () => {
          // Refetch status when transaction changes
          fetchStatus();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transaction_participants',
          filter: `transaction_id=eq.${transactionId}`,
        },
        () => {
          // Refetch status when participants change
          fetchStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [transactionId]);

  return { status, loading, error, refresh: () => setLoading(true) };
}
