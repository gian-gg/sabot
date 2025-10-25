'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi, WifiOff } from 'lucide-react';

interface CollaborativeEditorProps {
  documentId: string;
  userName?: string;
  userColor?: string;
}

// Global singleton to prevent multiple instances across hot reloads
const providerInstances = new Map<string, WebrtcProvider>();
const ydocInstances = new Map<string, Y.Doc>();

export default function CollaborativeEditor({
  documentId,
  userName = 'Anonymous',
  userColor = '#3b82f6',
}: CollaborativeEditorProps) {
  // Use singleton pattern for Yjs document
  const ydoc = useMemo(() => {
    if (!ydocInstances.has(documentId)) {
      console.log('📄 Creating new Y.Doc for:', documentId);
      ydocInstances.set(documentId, new Y.Doc());
    }
    return ydocInstances.get(documentId)!;
  }, [documentId]);

  const providerRef = useRef<WebrtcProvider | null>(null);
  const isMountedRef = useRef(true);
  const [status, setStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');
  const [connectedUsers, setConnectedUsers] = useState(0);
  const [providerReady, setProviderReady] = useState(false);

  // Initialize provider
  useEffect(() => {
    isMountedRef.current = true;

    // Check if we already have a provider
    if (providerInstances.has(documentId)) {
      console.log('♻️ Reusing existing provider');
      providerRef.current = providerInstances.get(documentId)!;
      setProviderReady(true);
      setStatus(providerRef.current.connected ? 'connected' : 'connecting');

      // Recount peers
      const provider = providerRef.current;
      const webrtcCount = provider.room?.webrtcConns?.size || 0;
      const bcCount = provider.room?.bcConns?.size || 0;
      setConnectedUsers(webrtcCount + bcCount + 1);

      return;
    }

    // Create new provider
    console.log('🚀 Creating new WebRTC provider for:', documentId);

    const webrtcProvider = new WebrtcProvider(documentId, ydoc, {
      signaling: ['wss://signaling.yjs.dev'],
      maxConns: 20 + Math.floor(Math.random() * 15),
      filterBcConns: false,
      peerOpts: {},
    });

    providerRef.current = webrtcProvider;
    providerInstances.set(documentId, webrtcProvider);
    setProviderReady(true);

    // Status handler
    const statusHandler = (event: { connected: boolean }) => {
      if (!isMountedRef.current) return;
      const status = event.connected ? 'connected' : 'disconnected';
      console.log('📡 WebRTC Status:', status);
      setStatus(status);
    };
    webrtcProvider.on('status', statusHandler);

    // Peers handler
    const peersHandler = (event: {
      webrtcPeers: unknown[];
      bcPeers: unknown[];
      added: unknown[];
      removed: unknown[];
    }) => {
      if (!isMountedRef.current) return;

      const webrtcCount = event.webrtcPeers?.length || 0;
      const bcCount = event.bcPeers?.length || 0;
      const totalPeers = webrtcCount + bcCount;

      console.log('👥 Peers changed:', {
        webrtcPeers: webrtcCount,
        bcPeers: bcCount,
        total: totalPeers,
        added: event.added?.length || 0,
        removed: event.removed?.length || 0,
      });

      setConnectedUsers(totalPeers + 1);
    };
    webrtcProvider.on('peers', peersHandler);

    // Cleanup - just detach listeners
    return () => {
      console.log('🔄 Component cleanup - keeping provider alive');
      webrtcProvider.off('status', statusHandler);
      webrtcProvider.off('peers', peersHandler);
    };
  }, [documentId, ydoc]);

  // Component mount tracking
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Initialize editor
  const editor = useEditor(
    {
      extensions: [
        // Use StarterKit but disable History since we're using Yjs
        StarterKit,
        Collaboration.configure({
          document: ydoc,
          field: 'default',
        }),
        CollaborationCursor.configure({
          provider: providerRef.current || undefined,
          user: {
            name: userName,
            color: userColor,
          },
        }),
      ],
      editorProps: {
        attributes: {
          class:
            'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] max-w-none p-4',
        },
      },
      immediatelyRender: false,
    },
    [providerReady, userName, userColor, ydoc]
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Collaborative Document</CardTitle>
            <CardDescription className="mt-1.5">
              Document ID:{' '}
              <code className="bg-secondary rounded px-1 py-0.5 text-xs">
                {documentId}
              </code>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={status === 'connected' ? 'default' : 'secondary'}
              className="gap-1.5"
            >
              {status === 'connected' ? (
                <>
                  <Wifi className="size-3" />
                  Connected
                </>
              ) : status === 'connecting' ? (
                <>
                  <div className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Connecting
                </>
              ) : (
                <>
                  <WifiOff className="size-3" />
                  Disconnected
                </>
              )}
            </Badge>
            {status === 'connected' && (
              <Badge variant="outline" className="gap-1.5">
                <Users className="size-3" />
                {connectedUsers} {connectedUsers === 1 ? 'user' : 'users'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-background rounded-lg border">
          <EditorContent editor={editor} />
        </div>
        <div className="text-muted-foreground mt-4 space-y-1 text-xs">
          <p>
            💡 Open this page in multiple tabs or share the URL to collaborate
            in real-time
          </p>
          <p>📝 Changes are synced automatically across all connected users</p>
          {providerRef.current && (
            <p className="text-primary">
              🔍 Debug - WebRTC:{' '}
              {providerRef.current.room?.webrtcConns?.size || 0} | Broadcast:{' '}
              {providerRef.current.room?.bcConns?.size || 0} | Status: {status}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
