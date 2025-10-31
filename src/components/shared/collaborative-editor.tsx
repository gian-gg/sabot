'use client';

import { useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface CollaborativeEditorProps {
  documentId: string;
  userName?: string;
  userColor?: string;
}

// Global singleton to prevent multiple instances across hot reloads
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

  // Initialize editor
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Collaboration.configure({
          document: ydoc,
          field: 'default',
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
    [userName, userColor, ydoc]
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-background rounded-lg border">
          <EditorContent editor={editor} />
        </div>
        <div className="text-muted-foreground mt-4 space-y-1 text-xs">
          <p>
            💡 Editor ready for collaboration - connect with PartyKit for
            real-time sync
          </p>
          <p>
            📝 Yjs document is configured and ready for provider integration
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
