'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TransactionStatusResponse } from '@/types/transaction';

const POLL_INTERVAL = 5000; // Poll every 5 seconds as fallback
const BROADCAST_SUCCESS_THRESHOLD = 3; // Disable polling after 3 successful broadcasts
const BROADCAST_TIMEOUT = 15000; // Re-enable polling if no broadcast for 15 seconds

export function useTransactionStatus(transactionId: string | null) {
  const [status, setStatus] = useState<TransactionStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastSuccessCountRef = useRef<number>(0);
  const lastBroadcastTimeRef = useRef<number>(Date.now());
  const pollingDisabledRef = useRef<boolean>(false);
  const broadcastHealthCheckRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // create supabase client inside effect so it's not a dependency
    const supabase = createClient();

    if (!transactionId) {
      setLoading(false);
      return;
    }

    console.log(
      `[TransactionStatus] 🚀 Initializing real-time updates for transaction: ${transactionId}`
    );

    // Fetch status with source tracking
    const fetchStatus = async (
      source: 'broadcast' | 'polling' | 'manual' = 'manual'
    ) => {
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
        } else if (source === 'polling') {
          console.log(
            '[TransactionStatus] 📡 Polling: received update',
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

    // Enable polling with logging
    const enablePolling = () => {
      if (pollIntervalRef.current) return; // Already enabled

      console.log(
        '[TransactionStatus] 🔄 Enabling polling (broadcast inactive or failed)'
      );
      pollingDisabledRef.current = false;

      pollIntervalRef.current = setInterval(() => {
        console.log('[TransactionStatus] 📡 Polling: fetching status');
        fetchStatus('polling');
      }, POLL_INTERVAL);
    };

    // Disable polling with logging
    const disablePolling = () => {
      if (!pollIntervalRef.current) return; // Already disabled

      console.log(
        '[TransactionStatus] ✅ Disabling polling (broadcast working reliably)'
      );
      pollingDisabledRef.current = true;

      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };

    // Check broadcast health - re-enable polling if no broadcast for a while
    const checkBroadcastHealth = () => {
      const timeSinceLastBroadcast = Date.now() - lastBroadcastTimeRef.current;

      if (
        timeSinceLastBroadcast > BROADCAST_TIMEOUT &&
        pollingDisabledRef.current
      ) {
        console.warn(
          `[TransactionStatus] ⚠️ No broadcast for ${timeSinceLastBroadcast}ms, re-enabling polling`
        );
        enablePolling();
        broadcastSuccessCountRef.current = 0; // Reset counter
      }
    };

    // Initial fetch
    fetchStatus('manual');

    // Start polling initially
    enablePolling();

    // Setup broadcast health monitoring (check every 10 seconds)
    broadcastHealthCheckRef.current = setInterval(checkBroadcastHealth, 10000);

    // Subscribe to Supabase Broadcast channel
    const channel = supabase
      .channel(`transaction:${transactionId}`)
      .on('broadcast', { event: 'transaction_update' }, async () => {
        console.log(
          '[TransactionStatus] ⚡ Broadcast event received: transaction_update'
        );

        // Track successful broadcast
        broadcastSuccessCountRef.current += 1;
        lastBroadcastTimeRef.current = Date.now();

        // Fetch updated status
        await fetchStatus('broadcast');

        // After threshold successful broadcasts, disable polling
        if (
          broadcastSuccessCountRef.current >= BROADCAST_SUCCESS_THRESHOLD &&
          !pollingDisabledRef.current
        ) {
          console.log(
            `[TransactionStatus] ✅ Broadcast proven reliable (${broadcastSuccessCountRef.current} successful updates)`
          );
          disablePolling();
        }
      })
      .on('broadcast', { event: 'deliverable_confirmed' }, async (payload) => {
        console.log(
          '[TransactionStatus] ⚡ Broadcast event received: deliverable_confirmed',
          payload
        );

        // Track successful broadcast
        broadcastSuccessCountRef.current += 1;
        lastBroadcastTimeRef.current = Date.now();

        // Fetch updated status
        await fetchStatus('broadcast');

        // After threshold successful broadcasts, disable polling
        if (
          broadcastSuccessCountRef.current >= BROADCAST_SUCCESS_THRESHOLD &&
          !pollingDisabledRef.current
        ) {
          console.log(
            `[TransactionStatus] ✅ Broadcast proven reliable (${broadcastSuccessCountRef.current} successful updates)`
          );
          disablePolling();
        }
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

      // Clear polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Clear health check
      if (broadcastHealthCheckRef.current) {
        clearInterval(broadcastHealthCheckRef.current);
        broadcastHealthCheckRef.current = null;
      }

      // Remove channel
      supabase.removeChannel(channel);
    };
  }, [transactionId]);

  return { status, setStatus, loading, error, refresh: () => setLoading(true) };
}
