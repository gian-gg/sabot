'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as Y from 'yjs';

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

  // Use refs to store the doc so it persists across re-renders
  const docRef = useRef<Y.Doc | null>(null);

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

  // Initialize Y.Doc only once per documentId
  useEffect(() => {
    if (!enabled || !documentId) return;

    // If we already have a doc for this documentId, don't create a new one
    if (docRef.current) {
      console.log('[useCollaboration] Using existing doc for:', documentId);
      setYDoc(docRef.current);
      return;
    }

    console.log('[useCollaboration] Initializing for documentId:', documentId);
    const doc = new Y.Doc();
    docRef.current = doc;
    console.log('[useCollaboration] Yjs Doc created');

    // Listen for document updates
    const docUpdateHandler = (update: Uint8Array, origin: unknown) => {
      console.log('[Yjs] Document updated:', update.length, 'bytes', {
        origin: origin ? 'REMOTE (provider)' : 'LOCAL',
      });
    };
    doc.on('update', docUpdateHandler);

    console.log('[useCollaboration] Setting state - ydoc');
    setYDoc(doc);

    return () => {
      console.log('[useCollaboration] Cleanup - keeping doc alive');
      doc.off('update', docUpdateHandler);
    };
  }, [documentId, enabled]);

  return {
    ydoc,
    provider: null,
    awareness: null,
    isConnected: false,
    localUser,
  };
}
