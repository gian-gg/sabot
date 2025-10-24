'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
// Collaboration extension is lazy-loaded to prevent SSR module evaluation errors
// import Collaboration from '@tiptap/extension-collaboration';
// import CollaborationCursor from '@tiptap/extension-collaboration-cursor'; // Disabled temporarily
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import Blockquote from '@tiptap/extension-blockquote';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { useCollaboration } from '@/lib/collaboration/use-collaboration';
import { type UserPresence } from '@/lib/collaboration/presence';
import { Loader } from 'lucide-react';

interface TiptapEditorProps {
  documentId: string;
  isReviewing: boolean;
  onContentChange?: (content: string) => void;
  onConnectionStatusChange?: (isConnected: boolean) => void;
  onActiveUsersChange?: (users: UserPresence[]) => void;
  onOpenSignature?: () => void;
  editorRef?: React.RefObject<HTMLDivElement | null>;
}

export function TiptapEditor({
  documentId,
  isReviewing,
  onContentChange,
  onConnectionStatusChange,
  onActiveUsersChange,
  editorRef,
}: TiptapEditorProps) {
  const { ydoc, isConnected, activeUsers, awareness } = useCollaboration({
    documentId,
    enabled: true,
  });

  // Lazy-load Collaboration extension to prevent SSR errors
  const [CollaborationExt, setCollaborationExt] = useState<unknown>(null);

  useEffect(() => {
    if (ydoc && awareness) {
      console.log('[Editor] Lazy-loading Collaboration extension...');
      import('@tiptap/extension-collaboration')
        .then((mod) => {
          console.log('[Editor] ✅ Collaboration extension loaded');
          setCollaborationExt(() => mod.default);
        })
        .catch((err) => {
          console.error(
            '[Editor] ❌ Failed to load Collaboration extension:',
            err
          );
        });
    }
  }, [ydoc, awareness]);

  // Log collaboration state changes
  useEffect(() => {
    console.log('[Editor] Collaboration state:', {
      ydoc: !!ydoc,
      awareness: !!awareness,
      isConnected,
      activeUsers: activeUsers.length,
      userNames: activeUsers.map((u) => u.name),
    });
    if (ydoc && awareness) {
      console.log('[Editor] Collaboration ready:', {
        yDocReady: true,
        awarenessReady: true,
      });
    }
  }, [ydoc, awareness, isConnected, activeUsers]);

  // Notify parent of active users changes
  useEffect(() => {
    onActiveUsersChange?.(activeUsers);
  }, [activeUsers, onActiveUsersChange]);

  const editor = useEditor(
    {
      extensions: [
        // Use StarterKit with modified configuration
        StarterKit.configure({
          strike: false,
          code: false,
          blockquote: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
        }),
        Underline,
        Strike,
        Code,
        Blockquote,
        BulletList,
        OrderedList,
        ListItem,
        Placeholder.configure({
          placeholder: 'Start typing your agreement...',
        }),
        Highlight.configure({
          multicolor: true,
        }),
        Typography,
        // Collaborative editing extensions (only add if ydoc and CollaborationExt are ready)
        ...(ydoc && awareness && CollaborationExt
          ? [
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (CollaborationExt as any).configure({
                document: ydoc,
              }),
              // TODO: Re-enable CollaborationCursor once awareness is properly initialized
              // CollaborationCursor.configure({
              //   provider: awareness,
              // }),
            ]
          : []),
      ],
      // When using Collaboration extension, NEVER set static content
      // The Collaboration extension manages all content from Y.Doc
      content: ydoc
        ? ''
        : `
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
      immediatelyRender: false,
      shouldRerenderOnTransaction: false,
      onCreate({ editor: editorInstance }) {
        console.log('[Editor] ✅ Editor created and ready');
        // Notify parent when editor is ready
        if (onContentChange) {
          onContentChange(editorInstance.getHTML());
        }
      },
      onUpdate({ editor: editorInstance, transaction }) {
        console.log(
          '[Editor] 📝 Editor update - origin:',
          transaction.getMeta('collaboration') ? 'remote' : 'local'
        );
        // Notify parent of content changes
        if (onContentChange) {
          onContentChange(editorInstance.getHTML());
        }
      },
      editable: !isReviewing,
    },
    [ydoc, awareness, CollaborationExt, isReviewing, onContentChange] // Re-create editor when collaboration becomes available
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const blockData = e.dataTransfer.getData('application/json');

      if (blockData && editor) {
        try {
          const block = JSON.parse(blockData);

          // Insert block as heading + paragraph
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

  // Notify parent of connection status changes
  useEffect(() => {
    onConnectionStatusChange?.(isConnected);
  }, [isConnected, onConnectionStatusChange]);

  if (!ydoc) {
    console.log('[Editor] Still initializing... ydoc not ready yet');
    return (
      <main className="relative flex-1 overflow-y-auto pt-14">
        <div className="mx-auto flex h-full max-w-4xl items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader className="h-5 w-5 animate-spin" />
            <div className="text-center">
              <p className="text-muted-foreground font-medium">
                Initializing editor...
              </p>
              <p className="text-muted-foreground/70 mt-2 text-xs">
                Check browser console for connection details
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  console.log('[Editor] ✅ Editor initialized, ydoc ready');

  return (
    <main className="relative flex flex-1 flex-col pt-14">
      {isReviewing && (
        <div className="pointer-events-none absolute inset-0 z-50">
          <div className="bg-primary/5 absolute inset-0" />
          <div className="scanning-line" />
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div
          ref={editorRef}
          className="min-h-full max-w-4xl py-12 pr-24 pb-20 pl-8"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* TipTap Editor */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Formatting Toolbar - Fixed at Bottom */}

      {/* EditorToolbar now expects quill prop, not editor. This component is deprecated. */}

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

        /* Legal Block Styles - Following Design System */

        /* Signature Block */
        :global(.signature-block) {
          border-top: 2px solid var(--border);
          padding-top: 2rem;
          margin-top: 3rem;
          margin-bottom: 2rem;
          page-break-inside: avoid;
        }

        :global(.signature-line) {
          width: 300px;
          border-bottom: 1px solid currentColor;
          margin-bottom: 0.5rem;
          height: 40px;
          display: block;
        }

        /* Party Information Block */
        :global(.party-block) {
          background: color-mix(in srgb, var(--primary) 5%, transparent);
          border-left: 4px solid var(--primary);
          padding: 1.5rem;
          margin: 1.5rem 0;
          border-radius: 0.5rem;
        }

        :global(.party-block h3) {
          color: var(--card-foreground);
          margin-top: 0;
        }

        :global(.party-block p) {
          margin-bottom: 0.75rem;
          color: var(--muted-foreground);
        }

        /* Clause Block */
        :global(.clause-block) {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
          border-left: 3px solid var(--border);
          transition: border-color 150ms ease-out;
        }

        :global(.clause-block:hover) {
          border-left-color: var(--primary);
        }

        :global(.clause-block h4) {
          color: var(--card-foreground);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        /* Whereas Clause */
        :global(.whereas-clause) {
          font-style: italic;
          margin: 1rem 0;
          padding-left: 2rem;
          color: var(--muted-foreground);
          border-left: 2px solid var(--primary);
          padding-left: 1.5rem;
          margin-left: 0.5rem;
        }

        :global(.whereas-clause strong) {
          color: var(--card-foreground);
          font-weight: 600;
        }

        /* Terms Block */
        :global(.terms-block) {
          margin: 2rem 0;
          padding: 1.5rem;
          background: var(--muted);
          border-radius: 0.5rem;
        }

        :global(.terms-block h2) {
          color: var(--card-foreground);
          margin-top: 0;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        :global(.terms-block ol) {
          margin-left: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--muted-foreground);
        }

        :global(.terms-block li) {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        :global(.terms-block strong) {
          color: var(--card-foreground);
          font-weight: 600;
        }

        /* Placeholder styling for editable content */
        :global(.ProseMirror [data-type='party'] p[style*='color: #999']),
        :global(.ProseMirror [data-type='clause'] p[style*='color: #999']),
        :global(.ProseMirror [data-type='whereas'] [style*='color: #999']),
        :global(.ProseMirror [data-type='terms'] [style*='color: #999']) {
          color: var(--muted-foreground) !important;
        }

        /* Focus states for legal blocks */
        :global(.ProseMirror [data-type='party']:focus-within),
        :global(.ProseMirror [data-type='clause']:focus-within),
        :global(.ProseMirror [data-type='signature']:focus-within),
        :global(.ProseMirror [data-type='terms']:focus-within) {
          background: var(--muted);
          border-radius: 0.375rem;
          transition: background-color 100ms ease-out;
        }

        /* Highlight clause when jumping from outline */
        :global(.highlight-clause) {
          animation: highlight-pulse 0.5s ease-in-out;
          background-color: rgba(59, 130, 246, 0.1) !important;
          border-left-color: var(--primary) !important;
          border-radius: 0.375rem;
        }

        @keyframes highlight-pulse {
          0% {
            background-color: rgba(59, 130, 246, 0.3);
          }
          50% {
            background-color: rgba(59, 130, 246, 0.1);
          }
          100% {
            background-color: transparent;
          }
        }

        /* Print styles for legal documents */
        @media print {
          :global(.signature-block) {
            page-break-inside: avoid;
          }

          :global(.party-block) {
            page-break-inside: avoid;
          }

          :global(.clause-block) {
            page-break-inside: avoid;
          }

          :global(.terms-block) {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}
