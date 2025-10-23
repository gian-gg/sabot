'use client';

import { useEffect, useState, useRef } from 'react';
import * as Y from 'yjs';
import { SupabaseProvider } from './supabase-provider';
import { createAwareness, type UserPresence } from './presence';

interface UseCollaborationProps {
  documentId: string;
  enabled?: boolean;
}

interface UseCollaborationReturn {
  ydoc: Y.Doc | null;
  provider: SupabaseProvider | null;
  awareness: unknown;
  isConnected: boolean;
  activeUsers: UserPresence[];
  error: Error | null;
}

/**
 * Hook to manage collaborative editing through Supabase
 */
export function useCollaboration({
  documentId,
  enabled = true,
}: UseCollaborationProps): UseCollaborationReturn {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<SupabaseProvider | null>(null);
  const [awareness, setAwareness] = useState<unknown>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const providerRef = useRef<SupabaseProvider | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);

  useEffect(() => {
    if (!enabled || !documentId) return;

    let mounted = true;

    const initializeCollaboration = async () => {
      try {
        const newYdoc = new Y.Doc();
        const newAwareness = createAwareness(newYdoc);

        const newProvider = new SupabaseProvider({
          ydoc: newYdoc,
          name: documentId,
          awareness: newAwareness,
        });

        await newProvider.connect();

        if (!mounted) return;

        ydocRef.current = newYdoc;
        providerRef.current = newProvider;

        setYdoc(newYdoc);
        setProvider(newProvider);
        setAwareness(newAwareness);
        setIsConnected(newProvider.isConnected());

        // Listen for awareness changes
        const awarenessHandler = () => {
          const states = newAwareness.getStates();
          const users: UserPresence[] = [];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          states.forEach((state: any) => {
            if (state.user && state.user.id !== newAwareness.clientID) {
              users.push(state.user);
            }
          });

          if (mounted) {
            setActiveUsers(users);
          }
        };

        newAwareness.on('awareness-update', awarenessHandler);

        return () => {
          newAwareness.off('awareness-update', awarenessHandler);
        };
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Collaboration initialization failed');
        if (mounted) {
          setError(error);
        }
        console.error('Collaboration error:', error);
      }
    };

    const cleanupPromise = initializeCollaboration();

    return () => {
      mounted = false;
      if (providerRef.current) {
        providerRef.current.disconnect();
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
      }
      cleanupPromise?.then((fn) => fn?.());
    };
  }, [documentId, enabled]);

  return {
    ydoc,
    provider,
    awareness,
    isConnected,
    activeUsers,
    error,
  };
}
