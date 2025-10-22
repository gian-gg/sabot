'use client';

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { useCollaboration } from '@/lib/collaboration/use-collaboration';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, Loader } from 'lucide-react';
import { CursorOverlay } from './cursor-overlay';

interface TiptapEditorProps {
  documentId: string;
  onOpenSignature: () => void;
  isReviewing: boolean;
}

export function TiptapEditor({
  documentId,
  onOpenSignature,
  isReviewing,
}: TiptapEditorProps) {
  const { ydoc, provider, isConnected, activeUsers } = useCollaboration({
    documentId,
    enabled: true,
  });

  const editor = useEditor({
    extensions: [
      // Use StarterKit directly — do not pass a non-existent 'history' option
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start typing your agreement...',
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      // Collaborative editing extensions (only add if ydoc is ready)
      ...(ydoc
        ? [
            Collaboration.configure({
              document: ydoc,
            }),
            CollaborationCursor.configure({
              provider: provider,
              user: {
                name: 'User',
                color: '#FF6B6B',
              },
            }),
          ]
        : []),
    ],
    content: `
      <h1>Partnership Agreement</h1>
      <p>This Partnership Agreement ("Agreement") is entered into as of [Date], by and between:</p>

      <h2>1. Preamble</h2>
      <p>WHEREAS, the parties wish to establish a partnership for the purpose of [describe purpose];</p>
      <p>WHEREAS, the parties desire to set forth the terms and conditions of their partnership;</p>

      <h2>2. Definitions</h2>
      <p><strong>2.1 Party A:</strong> [Legal name and details]</p>
      <p><strong>2.2 Party B:</strong> [Legal name and details]</p>
      <p><strong>2.3 Effective Date:</strong> The date on which this Agreement becomes effective.</p>

      <h2>3. Terms and Conditions</h2>
      <p><strong>3.1 Scope of Agreement:</strong> This Agreement shall govern the partnership between the parties for [describe scope].</p>
      <p><strong>3.2 Obligations:</strong> Each party agrees to fulfill their respective obligations as outlined in this section.</p>
    `,
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
  });

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const blockData = e.dataTransfer.getData('application/json');
      if (blockData && editor) {
        try {
          const block = JSON.parse(blockData);

          editor
            .chain()
            .focus()
            .insertContent({
              type: 'heading',
              attrs: { level: 2 },
              content: [
                {
                  type: 'text',
                  text: block.title,
                },
              ],
            })
            .insertContent({
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: block.content,
                },
              ],
            })
            .run();
        } catch (error) {
          console.error('Error inserting block:', error);
        }
      }
    },
    [editor]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  if (!ydoc) {
    return (
      <main className="bg-background relative flex-1 overflow-y-auto">
        <div className="mx-auto flex h-full max-w-4xl items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader className="h-5 w-5 animate-spin" />
            <span className="text-muted-foreground">
              Initializing editor...
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background relative flex-1 overflow-y-auto">
      {isReviewing && (
        <div className="pointer-events-none absolute inset-0 z-50">
          <div className="bg-primary/5 absolute inset-0" />
          <div className="scanning-line" />
        </div>
      )}

      {/* Connection Status Indicator */}
      {!isConnected && (
        <div className="sticky top-0 z-40 bg-yellow-50 px-4 py-2 text-center dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Connecting to server...
          </p>
        </div>
      )}

      {/* Active Users Indicator */}
      {activeUsers.length > 0 && (
        <div className="border-border/50 bg-muted/30 sticky top-0 z-40 border-b px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Editing with:</span>
            <div className="flex gap-1">
              {activeUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl p-8">
        <div className="mb-4 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSignature}
            className="border-border/50 hover:border-primary/50 hover:bg-accent bg-transparent"
          >
            <PenTool className="mr-2 h-4 w-4" />
            Add Signature
          </Button>
        </div>

        <Card
          className="border-border/50 bg-card relative min-h-[800px] p-12 shadow-lg"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <CursorOverlay />

          {/* TipTap Editor */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <EditorContent editor={editor} />
          </div>
        </Card>
      </div>

      {/* Editor Styles */}
      <style jsx>{`
        :global(.ProseMirror) {
          outline: none;
        }

        :global(.ProseMirror > * + *) {
          margin-top: 0.75em;
        }

        :global(.ProseMirror ul, .ProseMirror ol) {
          padding: 0 1rem;
        }

        :global(
          .ProseMirror h1,
          .ProseMirror h2,
          .ProseMirror h3,
          .ProseMirror h4,
          .ProseMirror h5,
          .ProseMirror h6
        ) {
          line-height: 1.1;
        }

        :global(.ProseMirror code) {
          background-color: rgba(0, 0, 0, 0.1);
          color: #d4d4d8;
          font-size: 0.9em;
          border-radius: 0.4em;
          padding: 0.25em 0.4em;
        }

        :global(.dark .ProseMirror code) {
          background-color: rgba(255, 255, 255, 0.1);
          color: #d4d4d8;
        }

        :global(.ProseMirror pre) {
          background: #0d0d0d;
          border-radius: 0.5rem;
          color: #ccc;
          font-family: 'JetBrains Mono', monospace;
          padding: 0.75rem 1rem;
          overflow-x: auto;
        }

        :global(.ProseMirror pre code) {
          background: none;
          color: inherit;
          font-size: 0.8rem;
          padding: 0;
        }

        :global(.collaboration-cursor__caret) {
          border-left: 1px solid currentColor;
          border-right: 1px solid currentColor;
          margin-left: -1px;
          margin-right: -1px;
          pointer-events: none;
          position: relative;
          word-break: normal;
        }

        :global(.collaboration-cursor__label) {
          border-radius: 3px 3px 3px 0;
          color: #0d0d0d;
          font-size: 12px;
          font-style: italic;
          font-weight: 500;
          left: -1px;
          padding: 0.1rem 0.3rem;
          position: absolute;
          top: -1.4em;
          user-select: none;
          white-space: nowrap;
        }

        :global(.dark .collaboration-cursor__label) {
          color: #fff;
        }

        :global(.ProseMirror .is-editor-empty:first-child::before) {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        :global(.scanning-line) {
          animation: scan 3s infinite;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(59, 130, 246, 0.3),
            transparent
          );
          height: 1px;
          pointer-events: none;
        }

        @keyframes scan {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>
    </main>
  );
}
