'use client';

import { useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { useCollaboration } from '@/lib/collaboration/use-collaboration';

interface CollaborativeEditorProps {
  documentId: string;
  userName?: string;
  userColor?: string;
}

export default function CollaborativeEditor({
  documentId,
  userName = 'Anonymous',
  userColor = '#3b82f6',
}: CollaborativeEditorProps) {
  // Use the collaboration hook
  const { ydoc, provider, awareness, isConnected, localUser } =
    useCollaboration({
      documentId,
      enabled: true,
      user: {
        name: userName,
        color: userColor,
      },
    });

  // Count connected users from awareness
  const connectedUsers = useMemo(() => {
    if (!awareness) return 1;
    return awareness.getStates().size;
  }, [awareness]);

  // Initialize editor
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Collaboration.configure({
          document: ydoc ?? undefined,
          field: 'default',
        }),
        CollaborationCursor.configure({
          provider: provider ?? undefined,
          user: {
            name: localUser.name,
            color: localUser.color,
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
    [ydoc, provider, localUser]
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
              variant={isConnected ? 'default' : 'secondary'}
              className="gap-1.5"
            >
              {isConnected ? (
                <>
                  <Wifi className="size-3" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="size-3" />
                  Connecting...
                </>
              )}
            </Badge>
            {isConnected && (
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
            💡{' '}
            {isConnected
              ? 'Connected to PartyKit!'
              : 'Connecting to PartyKit...'}{' '}
            Open in multiple tabs to collaborate
          </p>
          <p>📝 Changes sync in real-time across all connected users</p>
          <p className="text-primary">
            🔍 Status: {isConnected ? '✅ Connected' : '⏳ Connecting'} | Users:{' '}
            {connectedUsers}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
