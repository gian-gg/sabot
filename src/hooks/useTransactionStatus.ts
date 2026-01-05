'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TransactionStatusResponse } from '@/types/transaction';

export function useTransactionStatus(transactionId: string | null) {
  const [status, setStatus] = useState<TransactionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // create supabase client inside effect so it's not a dependency
    const supabase = createClient();

    if (!transactionId) {
      setLoading(false);
      return;
    }

    console.log(
      `[TransactionStatus] 🚀 Initializing broadcast-only real-time updates for transaction: ${transactionId}`
    );

    // Fetch status with source tracking
    const fetchStatus = async (source: 'broadcast' | 'manual' = 'manual') => {
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

        // Log successful fetch with source
        if (source === 'broadcast') {
          console.log(
            '[TransactionStatus] ⚡ Broadcast: received update',
            data.status
          );
        }
      } catch (err) {
        console.error('[TransactionStatus] ❌ Error fetching status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStatus('manual');

    // Subscribe to Supabase Broadcast channel
    const channel = supabase
      .channel(`transaction:${transactionId}`)
      .on('broadcast', { event: 'transaction_update' }, async () => {
        console.log(
          '[TransactionStatus] ⚡ Broadcast event received: transaction_update'
        );

        // Fetch updated status
        await fetchStatus('broadcast');
      })
      .on('broadcast', { event: 'deliverable_confirmed' }, async (payload) => {
        console.log(
          '[TransactionStatus] ⚡ Broadcast event received: deliverable_confirmed',
          payload
        );

        // Fetch updated status
        await fetchStatus('broadcast');
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[TransactionStatus] 📡 Subscribed to realtime channel');
        }
      });

    // Cleanup
    return () => {
      console.log(
        `[TransactionStatus] 🛑 Cleaning up real-time updates for transaction: ${transactionId}`
      );

      // Remove channel
      supabase.removeChannel(channel);
    };
  }, [transactionId]);

  return { status, setStatus, loading, error, refresh: () => setLoading(true) };
}
