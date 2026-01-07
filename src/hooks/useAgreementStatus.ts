'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AgreementStatusResponse } from '@/types/agreement';

export function useAgreementStatus(agreementId: string | null) {
  const [status, setStatus] = useState<AgreementStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // create supabase client inside effect so it's not a dependency
    const supabase = createClient();

    if (!agreementId) {
      setLoading(false);
      return;
    }

    console.log(
      `[AgreementStatus] 🚀 Initializing broadcast-only real-time updates for agreement: ${agreementId}`
    );

    // Fetch status with source tracking
    const fetchStatus = async (source: 'broadcast' | 'manual' = 'manual') => {
      try {
        const response = await fetch(`/api/agreement/${agreementId}/status`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `HTTP ${response.status}: Failed to fetch agreement status`
          );
        }
        const data = await response.json();
        setStatus(data);
        setError(null);

        // Log successful fetch with source
        if (source === 'broadcast') {
          console.log(
            '[AgreementStatus] ⚡ Broadcast: received update',
            data.agreement.status
          );
        }
      } catch (err) {
        console.error('[AgreementStatus] ❌ Error fetching status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStatus('manual');

    // Subscribe to Supabase Broadcast channel
    const channel = supabase
      .channel(`agreement:${agreementId}`)
      .on('broadcast', { event: 'agreement_update' }, async () => {
        console.log(
          '[AgreementStatus] ⚡ Broadcast event received: agreement_update'
        );

        // Fetch updated status
        await fetchStatus('broadcast');
      })
      .on('broadcast', { event: 'participant_joined' }, async (payload) => {
        console.log(
          '[AgreementStatus] ⚡ Broadcast event received: participant_joined',
          payload
        );

        // Fetch updated status
        await fetchStatus('broadcast');
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[AgreementStatus] 📡 Subscribed to realtime channel');
        }
      });

    // Cleanup
    return () => {
      console.log(
        `[AgreementStatus] 🛑 Cleaning up real-time updates for agreement: ${agreementId}`
      );

      // Remove channel
      supabase.removeChannel(channel);
    };
  }, [agreementId]);

  return { status, setStatus, loading, error, refresh: () => setLoading(true) };
}
