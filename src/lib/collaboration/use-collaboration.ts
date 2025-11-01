'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import YPartyKitProvider from 'y-partykit/provider';

export interface UseCollaborationOptions {
  documentId: string;
  enabled?: boolean;
  user?: {
    name?: string;
    color?: string;
    id?: string;
  };
}

export function useCollaboration({
  documentId,
  enabled = true,
  user,
}: UseCollaborationOptions) {
  const [ydoc, setYDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<YPartyKitProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use refs to store the doc and provider so they persist across re-renders
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<YPartyKitProvider | null>(null);

  // stable user id for awareness
  const localUser = useMemo(() => {
    const id = user?.id ?? `user-${Math.floor(Math.random() * 1e6)}`;
    const name = user?.name ?? `Guest-${id.slice(-4)}`;
    const color =
      user?.color ??
      (() => {
        // pick a pastel color
        const palette = [
          '#f97316',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4',
          '#f43f5e',
          '#10b981',
        ];
        return palette[Math.floor(Math.random() * palette.length)];
      })();
    return { id, name, color };
  }, [user]);

  // Initialize Y.Doc and PartyKit provider once per documentId
  useEffect(() => {
    if (!enabled || !documentId) return;

    // If we already have a provider for this documentId, reuse it
    if (providerRef.current && docRef.current) {
      console.log(
        '[useCollaboration] Using existing doc and provider for:',
        documentId
      );
      setYDoc(docRef.current);
      setProvider(providerRef.current);
      setIsConnected(providerRef.current.wsconnected);
      return;
    }

    console.log('[useCollaboration] Initializing for documentId:', documentId);
    const doc = new Y.Doc();
    docRef.current = doc;
    console.log('[useCollaboration] Yjs Doc created');

    // Get PartyKit host from environment or use default
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

    console.log('[useCollaboration] Creating PartyKit provider...');
    const pkProvider = new YPartyKitProvider(host, documentId, doc, {
      party: 'collaboration',
    });
    providerRef.current = pkProvider;
    console.log('[useCollaboration] PartyKit provider created');

    // Set awareness state
    if (pkProvider.awareness) {
      pkProvider.awareness.setLocalStateField('user', {
        name: localUser.name,
        color: localUser.color,
        id: localUser.id,
      });
      console.log('[PartyKit] Awareness state set');
    }

    // Connection status handler
    const handleStatus = ({ status }: { status: string }) => {
      const connected = status === 'connected';
      console.log('[PartyKit] Connection status:', status);
      setIsConnected(connected);
    };
    pkProvider.on('status', handleStatus);

    // Sync handler
    const handleSync = (isSynced: boolean) => {
      console.log('[PartyKit] Synced:', isSynced);
    };
    pkProvider.on('sync', handleSync);

    // Listen for document updates
    const docUpdateHandler = (update: Uint8Array, origin: unknown) => {
      const isLocalUpdate = origin === pkProvider;
      console.log('[Yjs] Document updated:', update.length, 'bytes', {
        origin: isLocalUpdate ? 'LOCAL' : 'REMOTE (PartyKit)',
      });
    };
    doc.on('update', docUpdateHandler);

    console.log('[useCollaboration] Setting state - ydoc and provider');
    setYDoc(doc);
    setProvider(pkProvider);

    return () => {
      console.log('[useCollaboration] Cleanup - keeping provider alive');
      pkProvider.off('status', handleStatus);
      pkProvider.off('sync', handleSync);
      doc.off('update', docUpdateHandler);
    };
  }, [documentId, enabled, localUser]);

  return {
    ydoc,
    provider,
    awareness: provider?.awareness ?? null,
    isConnected,
    localUser,
  };
}
