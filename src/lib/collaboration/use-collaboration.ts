'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

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
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use refs to store the doc and provider so they persist across re-renders
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);

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

  // Initialize Y.Doc and WebrtcProvider only once per documentId
  useEffect(() => {
    if (!enabled || !documentId) return;

    // If we already have a provider for this documentId, don't create a new one
    if (providerRef.current && docRef.current) {
      console.log(
        '[useCollaboration] Using existing doc and provider for:',
        documentId
      );
      setYDoc(docRef.current);
      setProvider(providerRef.current);
      return;
    }

    console.log('[useCollaboration] Initializing for documentId:', documentId);
    const doc = new Y.Doc();
    docRef.current = doc;
    console.log('[useCollaboration] Yjs Doc created');

    // Use the maintained yjs.dev signaling server
    // Note: The old Heroku servers (y-webrtc-signaling-*.herokuapp.com) are no longer working
    const signalingServers = [
      'wss://sabot-signaling-server.fly.dev', // ✅ official maintained server
    ];

    console.log('[useCollaboration] Creating WebrtcProvider...');
    const prov = new WebrtcProvider(documentId, doc, {
      signaling: signalingServers,
      // comment: you can add password: 'secret' to protect rooms
    });
    providerRef.current = prov;
    console.log('[useCollaboration] WebrtcProvider created');

    // Helper function to set awareness state
    const setAwarenessState = () => {
      try {
        if (prov && prov.awareness) {
          prov.awareness.setLocalStateField('user', {
            name: localUser.name,
            color: localUser.color,
            id: localUser.id,
          });
          console.log('[y-webrtc] Awareness state set successfully');
        }
      } catch (error) {
        console.warn('[y-webrtc] Failed to set awareness state:', error);
      }
    };

    // Defer awareness setup until provider is ready (equivalent to Vue's $nextTick)
    // This ensures the provider is fully initialized before we access awareness
    setTimeout(() => {
      setAwarenessState();
    }, 0);

    // listen connection status
    prov.on('status', ({ connected }: { connected: boolean }) => {
      console.log(
        '[y-webrtc] Connection status:',
        connected ? '✅ CONNECTED' : '❌ DISCONNECTED'
      );
      setIsConnected(connected);

      // Set awareness when connection is established
      if (connected) {
        setAwarenessState();
      }
    });

    // Listen for peer changes
    prov.on(
      'peers',
      ({
        added,
        removed,
        webrtcPeers,
      }: {
        added: string[];
        removed: string[];
        webrtcPeers: unknown[];
      }) => {
        console.log('[y-webrtc] Peers changed:', {
          added,
          removed,
          totalPeers: webrtcPeers.length,
        });
      }
    );

    // Listen for document updates
    const docUpdateHandler = (update: Uint8Array, origin: unknown) => {
      const isLocalUpdate = origin === prov;
      console.log('[Yjs] Document updated:', update.length, 'bytes', {
        origin: isLocalUpdate ? 'LOCAL (WebrtcProvider)' : 'REMOTE (peer)',
        isLocalUpdate,
      });
    };
    doc.on('update', docUpdateHandler);

    // Log sync state - helps debug if syncing is actually happening
    console.log('[y-webrtc] Sync config:', {
      awareness: !!prov.awareness,
      room: documentId,
      signalingServerCount: signalingServers.length,
    });

    // Listen for sync events from WebRTC
    prov.on('synced', ({ synced }: { synced: boolean }) => {
      console.log(
        '[y-webrtc] Synced event:',
        synced ? '✅ SYNCED' : '❌ NOT_SYNCED'
      );
    });

    console.log('[useCollaboration] Setting state - ydoc and provider');
    setYDoc(doc);
    setProvider(prov);

    return () => {
      // Don't destroy the doc on cleanup - it needs to persist for the collaboration session
      // Keep update listener attached so it continues to work
      console.log(
        '[useCollaboration] Cleanup - keeping doc and provider alive'
      );
    };
  }, [documentId, enabled]);

  // Update awareness whenever localUser changes
  useEffect(() => {
    if (!providerRef.current?.awareness || !localUser) return;

    console.log(
      '[useCollaboration] Updating awareness with new localUser:',
      localUser
    );
    try {
      providerRef.current.awareness.setLocalStateField('user', {
        name: localUser.name,
        color: localUser.color,
        id: localUser.id,
      });
      console.log('[y-webrtc] Awareness updated with new user info');
    } catch (error) {
      console.warn('[y-webrtc] Failed to update awareness:', error);
    }
  }, [localUser]);

  return {
    ydoc,
    provider,
    awareness: provider?.awareness ?? null,
    isConnected,
    localUser,
  };
}
