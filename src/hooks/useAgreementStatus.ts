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
          throw new Error('Failed to fetch status');
        }
        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (err) {
        console.error('[AgreementStatus] Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStatus('manual');

    // Poll every 2 seconds
    const pollInterval = setInterval(() => {
      fetchStatus('manual');
    }, 2000);

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
      .on('broadcast', { event: 'idea_blocks_submitted' }, async (payload) => {
        console.log(
          '[AgreementStatus] ⚡ Broadcast event received: idea_blocks_submitted',
          payload
        );

        // If both parties submitted and this is from AI generation, trigger completion
        if (payload.bothSubmitted) {
          window.dispatchEvent(
            new CustomEvent('ai-generation-complete', {
              detail: { agreementId: payload.agreementId || agreementId },
            })
          );
        }

        // Fetch updated status
        await fetchStatus('broadcast');
      })
      .on('broadcast', { event: 'prompt_submitted' }, async (payload) => {
        console.log(
          '[AgreementStatus] ⚡ Broadcast event received: prompt_submitted',
          payload
        );

        // Fetch updated status
        await fetchStatus('broadcast');
      })
      .on('broadcast', { event: 'ai_generation_complete' }, async (payload) => {
        console.log(
          '[AgreementStatus] ⚡ Broadcast event received: ai_generation_complete',
          payload
        );

        // Immediately trigger completion for both users
        // This ensures both parties proceed to the editor
        window.dispatchEvent(
          new CustomEvent('ai-generation-complete', {
            detail: { agreementId: payload.agreementId },
          })
        );

        // Also fetch updated status
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

      // Clear polling interval
      clearInterval(pollInterval);

      // Remove channel
      supabase.removeChannel(channel);
    };
  }, [agreementId]);

  return { status, setStatus, loading, error, refresh: () => setLoading(true) };
}
