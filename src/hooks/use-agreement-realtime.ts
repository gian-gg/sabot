'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface AgreementParticipant {
  id: string;
  user_id: string;
  agreement_id: string;
  role: 'creator' | 'invitee';
  has_confirmed: boolean;
  joined_at: string;
  name?: string;
  email?: string;
  avatar?: string;
}

interface UseAgreementRealtimeOptions {
  agreementId: string;
  enabled?: boolean;
}

export function useAgreementRealtime({
  agreementId,
  enabled = true,
}: UseAgreementRealtimeOptions) {
  console.log('[useAgreementRealtime] Hook initialized', {
    agreementId,
    enabled,
  });

  const [participants, setParticipants] = useState<AgreementParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);

  // Expose refetch function for manual refreshes
  // Returns a promise that resolves after state is updated
  const refetchParticipants = async (): Promise<AgreementParticipant[]> => {
    if (!supabaseRef.current || !agreementId) {
      console.warn(
        '[useAgreementRealtime] Refetch called but missing supabase or agreementId'
      );
      return [];
    }

    try {
      console.log(
        '[useAgreementRealtime] Manual refetch triggered for agreement:',
        agreementId
      );
      const { data, error: fetchError } = await supabaseRef.current
        .from('agreement_participants')
        .select(
          'id, user_id, agreement_id, role, has_confirmed, joined_at, name, email, avatar'
        )
        .eq('agreement_id', agreementId);

      if (fetchError) {
        console.error('[useAgreementRealtime] Refetch error:', fetchError);
        return [];
      }

      const updatedData = data || [];
      console.log(
        '[useAgreementRealtime] Refetch received data:',
        updatedData.length,
        'participants'
      );
      console.log(
        '[useAgreementRealtime] Participant details:',
        updatedData.map((p) => ({
          id: p.id,
          user_id: p.user_id,
          has_confirmed: p.has_confirmed,
          name: p.name,
          role: p.role,
        }))
      );

      // Update state synchronously (state update queued)
      setParticipants(updatedData);

      console.log('[useAgreementRealtime] ✅ State updated with fresh data');

      // Return the fresh data immediately so caller can use it
      return updatedData;
    } catch (err) {
      console.error('[useAgreementRealtime] Refetch exception:', err);
      return [];
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log('[useAgreementRealtime] useEffect - fetch triggered', {
      agreementId,
      enabled,
    });

    if (!enabled || !agreementId) {
      console.log(
        '[useAgreementRealtime] Skipping fetch - enabled or agreementId missing'
      );
      return;
    }

    const fetchInitialData = async () => {
      try {
        console.log(
          '[useAgreementRealtime] Starting fetch for agreementId:',
          agreementId
        );
        setIsLoading(true);
        setError(null);

        const supabase = createClient();
        supabaseRef.current = supabase;
        console.log('[useAgreementRealtime] Supabase client created');

        // Initial fetch of participants
        console.log('[useAgreementRealtime] Fetching participants from DB...');
        const { data, error: fetchError } = await supabase
          .from('agreement_participants')
          .select(
            'id, user_id, agreement_id, role, has_confirmed, joined_at, name, email, avatar'
          )
          .eq('agreement_id', agreementId);

        if (fetchError) {
          console.error('[useAgreementRealtime] Fetch error:', fetchError);
          setError(fetchError.message);
          setIsLoading(false);
          return;
        }

        setParticipants(data || []);
        console.log('[useAgreementRealtime] ✅ Initial participants loaded:', {
          count: data?.length,
          participants: data,
        });
        setIsLoading(false);
      } catch (err) {
        console.error('[useAgreementRealtime] Fetch exception:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [agreementId, enabled]);

  // Setup polling for live updates (fallback approach)
  useEffect(() => {
    if (!enabled || !agreementId) {
      console.log(
        '[useAgreementRealtime] Polling - skipping, enabled or agreementId missing'
      );
      return;
    }

    const POLL_INTERVAL = 3000; // Poll every 3 seconds

    // Polling function
    const pollParticipants = async () => {
      if (!supabaseRef.current) return;

      try {
        console.log('[useAgreementRealtime] Polling for updates...');
        const { data, error: fetchError } = await supabaseRef.current
          .from('agreement_participants')
          .select(
            'id, user_id, agreement_id, role, has_confirmed, joined_at, name, email, avatar'
          )
          .eq('agreement_id', agreementId);

        if (fetchError) {
          console.error('[useAgreementRealtime] Polling error:', fetchError);
          return;
        }

        setParticipants(data || []);
      } catch (err) {
        console.error('[useAgreementRealtime] Polling exception:', err);
      }
    };

    // Set up polling interval
    pollIntervalRef.current = setInterval(pollParticipants, POLL_INTERVAL);

    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        console.log('[useAgreementRealtime] Clearing polling interval');
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [agreementId, enabled]);

  const allConfirmed =
    participants.length > 0 && participants.every((p) => p.has_confirmed);

  return {
    participants,
    isLoading,
    error,
    allConfirmed,
    participantCount: participants.length,
    refetch: refetchParticipants,
  };
}
