'use client';

import { useEffect, useState, useRef } from 'react';
import { SupabaseProvider } from './supabase-provider';
import { createAwareness, type UserPresence } from './presence';
import { createClient } from '@/lib/supabase/client';

// Lazy-load Yjs to prevent SSR module evaluation errors
// Yjs requires browser APIs and can't be evaluated during server-side bundling
type YModule = typeof import('yjs');

interface UseCollaborationProps {
  documentId: string;
  enabled?: boolean;
}

interface UseCollaborationReturn {
  ydoc: unknown; // Y.Doc type (lazy-loaded, so use unknown)
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
  const [ydoc, setYdoc] = useState<unknown>(null); // Y.Doc (lazy-loaded)
  const [provider, setProvider] = useState<SupabaseProvider | null>(null);
  const [awareness, setAwareness] = useState<unknown>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const providerRef = useRef<SupabaseProvider | null>(null);
  const ydocRef = useRef<unknown>(null); // Y.Doc (lazy-loaded)

  useEffect(() => {
    if (!enabled || !documentId) return;

    let mounted = true;

    const initializeCollaboration = async () => {
      try {
        console.log(
          '[Collab] 🚀 START - Initializing collaboration for document:',
          documentId
        );

        // CRITICAL: Dynamically import Yjs to prevent server-side module evaluation
        // Yjs requires browser APIs and can't be evaluated during bundling
        console.log('[Collab] Lazy-loading Yjs...');
        const { default: Y } = (await import('yjs')) as YModule;
        console.log('[Collab] ✅ Yjs loaded');

        // Fetch current user
        console.log('[Collab] Fetching current user...');
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error('No user logged in');
        }

        console.log('[Collab] ✅ Current user:', {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name,
        });

        console.log('[Collab] Creating Y.Doc...');
        const newYdoc = new Y.Doc();
        console.log('[Collab] ✅ Y.Doc created');

        console.log('[Collab] Getting XmlFragment for shared content...');
        const fragment = newYdoc.getXmlFragment('shared');
        console.log('[Collab] XmlFragment length:', fragment.length);
        // Don't manually initialize - let Collaboration extension handle it

        console.log('[Collab] Creating awareness...');
        const newAwareness = createAwareness(
          newYdoc,
          user.id,
          user.email,
          user.user_metadata?.name || user.email?.split('@')[0]
        );
        console.log('[Collab] ✅ Awareness created');

        console.log('[Collab] Creating SupabaseProvider...');
        const newProvider = new SupabaseProvider({
          ydoc: newYdoc,
          name: documentId,
          awareness: newAwareness,
        });
        console.log('[Collab] ✅ SupabaseProvider created');

        console.log('[Collab] Attempting to connect provider...');
        await newProvider.connect();
        console.log('[Collab] ✅ SupabaseProvider connected successfully');

        if (!mounted) return;

        console.log('[Collab] Component still mounted, setting state...');

        ydocRef.current = newYdoc;
        providerRef.current = newProvider;

        console.log('[Collab] Setting ydoc state...');
        setYdoc(newYdoc);
        console.log('[Collab] ✅ ydoc state set');

        console.log('[Collab] Setting provider state...');
        setProvider(newProvider);
        console.log('[Collab] ✅ provider state set');

        console.log('[Collab] Setting awareness state...');
        setAwareness(newAwareness);
        console.log('[Collab] ✅ awareness state set');

        console.log('[Collab] Setting isConnected to true...');
        setIsConnected(true);
        console.log('[Collab] ✅ isConnected state set');

        // Listen for awareness changes
        const awarenessHandler = () => {
          const states = newAwareness.getStates();
          const users: UserPresence[] = [];

          console.log('[Collab] Awareness update, total states:', states.size);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          states.forEach((state: any) => {
            console.log('[Collab] State:', {
              user: state.user?.name,
              id: state.user?.id,
              email: state.user?.email,
            });
            if (state.user && state.user.id !== newAwareness.clientID) {
              users.push(state.user);
            }
          });

          console.log(
            '[Collab] Active remote users:',
            users.length,
            users.map((u) => u.name)
          );

          if (mounted) {
            setActiveUsers(users);
          }
        };

        newAwareness.on('awareness-update', awarenessHandler);
        console.log('[Collab] Registered awareness-update listener');

        return () => {
          newAwareness.off('awareness-update', awarenessHandler);
        };
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Collaboration initialization failed');
        console.error('[Collab] ❌ INITIALIZATION FAILED:', error);
        console.error('[Collab] Error message:', error.message);
        console.error('[Collab] Error stack:', error.stack);
        if (mounted) {
          setError(error);
        }
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
