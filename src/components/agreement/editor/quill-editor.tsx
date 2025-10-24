'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import { useCollaboration } from '@/lib/collaboration/use-collaboration';
import { type UserPresence } from '@/lib/collaboration/presence';
import { Loader } from 'lucide-react';
import { EditorToolbar } from './editor-toolbar';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  documentId: string;
  isReviewing: boolean;
  onContentChange?: (content: string) => void;
  onConnectionStatusChange?: (isConnected: boolean) => void;
  onActiveUsersChange?: (users: UserPresence[]) => void;
  onOpenSignature?: () => void;
  editorRef?: React.RefObject<HTMLDivElement | null>;
}

export function QuillEditor({
  documentId,
  isReviewing,
  onContentChange,
  onConnectionStatusChange,
  onActiveUsersChange,
  onOpenSignature,
  editorRef,
}: QuillEditorProps) {
  const { ydoc, isConnected, activeUsers } = useCollaboration({
    documentId,
    enabled: true,
  });

  const quillRef = useRef<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [quillReady, setQuillReady] = useState(false);

  // Initialize Quill (without complex Y.js binding)
  useEffect(() => {
    console.log('[QuillEditor] Effect running:', {
      containerReady: !!containerRef.current,
      quillReady,
      containerElement: containerRef.current?.className,
    });

    if (!containerRef.current) {
      console.warn('[QuillEditor] ⚠️ Container not ready yet');
      return;
    }

    if (quillReady) {
      console.log('[QuillEditor] Quill already ready, skipping');
      return;
    }

    try {
      console.log('[QuillEditor] 🚀 Starting Quill initialization...');

      // Clear any existing Quill instance
      if (quillRef.current) {
        console.log('[QuillEditor] Clearing previous instance');
        quillRef.current = null;
      }

      console.log('[QuillEditor] Creating new Quill instance...');
      const quill = new Quill(containerRef.current, {
        theme: 'snow',
        placeholder: 'Start typing your agreement...',
        modules: {
          toolbar: false,
          history: { userOnly: true },
        },
        readOnly: isReviewing,
      });

      console.log('[QuillEditor] ✅ Quill instance created');
      quillRef.current = quill;

      // Debug: Check if editor element is properly created
      const editorEl = quill.root;
      console.log('[QuillEditor] Editor root element:', {
        hasRoot: !!editorEl,
        tagName: editorEl?.tagName,
        id: editorEl?.id,
        className: editorEl?.className,
        width: editorEl?.offsetWidth,
        height: editorEl?.offsetHeight,
        contentEditable: editorEl?.contentEditable,
        parentElement: editorEl?.parentElement?.className,
      });

      // Track content changes
      console.log('[QuillEditor] Setting up text-change listener...');
      let updateTimeout: NodeJS.Timeout;
      quill.on('text-change', (delta, oldDelta, source) => {
        const html = quill.root.innerHTML;
        const text = quill.getText();

        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
          console.log('[QuillEditor] 💾 Content changed:', {
            htmlLength: html.length,
            textLength: text.length,
            source,
          });
          onContentChange?.(html);
        }, 300);
      });

      // Ensure editor is enabled
      console.log(
        '[QuillEditor] Enabling editor (isReviewing=' + isReviewing + ')'
      );
      quill.enable(!isReviewing);

      // Focus editor
      console.log('[QuillEditor] Focusing editor...');
      quill.focus();
      console.log('[QuillEditor] ✅ Quill fully initialized and focused');

      // Mark as ready
      setQuillReady(true);
      console.log('[QuillEditor] 🎉 State updated: quillReady = true');
    } catch (error) {
      console.error('[QuillEditor] ❌ INITIALIZATION FAILED:', error);
      if (error instanceof Error) {
        console.error('[QuillEditor] Error message:', error.message);
        console.error('[QuillEditor] Error stack:', error.stack);
      }
    }
  }, [quillReady, onContentChange, isReviewing]);

  // Update readonly state
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!isReviewing);
    }
  }, [isReviewing]);

  // Notify parent of active users changes
  useEffect(() => {
    onActiveUsersChange?.(activeUsers);
  }, [activeUsers, onActiveUsersChange]);

  // Notify parent of connection status changes
  useEffect(() => {
    onConnectionStatusChange?.(isConnected);
  }, [isConnected, onConnectionStatusChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const blockData = e.dataTransfer.getData('application/json');

    if (blockData && quillRef.current) {
      try {
        const block = JSON.parse(blockData);
        const quill = quillRef.current;
        const index = quill.getSelection()?.index || quill.getLength();

        // Insert heading
        quill.insertText(index, block.title, { header: 2 });
        quill.insertText(index + block.title.length, '\n');

        // Insert content
        quill.insertText(index + block.title.length + 1, block.content);
        quill.insertText(
          index + block.title.length + 1 + block.content.length,
          '\n'
        );

        quill.setSelection(
          index + block.title.length + 1 + block.content.length + 1
        );
      } catch (error) {
        console.error('Error inserting block:', error);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <main className="relative flex flex-1 flex-col pt-14">
      {isReviewing && (
        <div className="pointer-events-none absolute inset-0 z-50">
          <div className="bg-primary/5 absolute inset-0" />
          <div className="scanning-line" />
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="relative flex-1 overflow-y-auto">
        {/* Loading Overlay */}
        {!quillReady && (
          <div className="bg-background/50 absolute inset-0 z-40 flex items-center justify-center backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader className="h-5 w-5 animate-spin" />
              <div className="text-center">
                <p className="text-muted-foreground font-medium">
                  Initializing editor...
                </p>
                <p className="text-muted-foreground/70 mt-2 text-xs">
                  {!ydoc ? 'Loading document...' : 'Setting up editor...'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          ref={editorRef}
          className="min-h-full max-w-4xl py-12 pr-24 pb-20 pl-8"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Quill Editor Container */}
          <div
            ref={containerRef}
            className="quill-editor prose prose-slate dark:prose-invert max-w-none"
          />
        </div>
      </div>

      {/* Formatting Toolbar - Fixed at Bottom */}
      <EditorToolbar
        quill={quillRef.current}
        onInsertSignature={onOpenSignature}
      />

      {/* Editor Styles */}
      <style jsx global>{`
        .quill-editor.ql-container {
          font-size: 16px;
          font-family: inherit;
          border: none;
          padding: 0;
        }

        .quill-editor .ql-editor {
          padding: 0;
          min-height: auto;
          line-height: 1.6;
          color: currentColor;
          outline: none;
          user-select: text;
        }

        .quill-editor .ql-editor p,
        .quill-editor .ql-editor h1,
        .quill-editor .ql-editor h2,
        .quill-editor .ql-editor h3,
        .quill-editor .ql-editor h4,
        .quill-editor .ql-editor h5,
        .quill-editor .ql-editor h6,
        .quill-editor .ql-editor ul,
        .quill-editor .ql-editor ol,
        .quill-editor .ql-editor blockquote,
        .quill-editor .ql-editor pre {
          color: currentColor;
          margin: 0.5em 0;
        }

        .quill-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground) / 0.5);
          font-style: normal;
          content: attr(data-placeholder);
        }

        .quill-editor h1,
        .quill-editor h2,
        .quill-editor h3,
        .quill-editor h4,
        .quill-editor h5,
        .quill-editor h6 {
          line-height: 1.1;
          font-weight: 600;
        }

        .quill-editor h1 {
          font-size: 1.875rem;
        }

        .quill-editor h2 {
          font-size: 1.5rem;
        }

        .quill-editor h3 {
          font-size: 1.25rem;
        }

        .quill-editor > * + * {
          margin-top: 0.75em;
        }

        .quill-editor ul,
        .quill-editor ol {
          padding-left: 1rem;
        }

        .quill-editor code {
          background-color: rgba(0, 0, 0, 0.1);
          color: #d4d4d8;
          font-size: 0.9em;
          border-radius: 0.4em;
          padding: 0.25em 0.4em;
        }

        .dark .quill-editor code {
          background-color: rgba(255, 255, 255, 0.1);
          color: #d4d4d8;
        }

        .quill-editor pre {
          background: #0d0d0d;
          border-radius: 0.5rem;
          color: #ccc;
          font-family: 'JetBrains Mono', monospace;
          padding: 0.75rem 1rem;
          overflow-x: auto;
        }

        .quill-editor pre code {
          background: none;
          color: inherit;
          font-size: 0.8rem;
          padding: 0;
        }

        /* Legal Block Styles */
        .signature-block {
          border-top: 2px solid var(--border);
          padding-top: 2rem;
          margin-top: 3rem;
          margin-bottom: 2rem;
          page-break-inside: avoid;
        }

        .signature-line {
          width: 300px;
          border-bottom: 1px solid currentColor;
          margin-bottom: 0.5rem;
          height: 40px;
          display: block;
        }

        .party-block {
          background: color-mix(in srgb, var(--primary) 5%, transparent);
          border-left: 4px solid var(--primary);
          padding: 1.5rem;
          margin: 1.5rem 0;
          border-radius: 0.5rem;
        }

        .party-block h3 {
          color: var(--card-foreground);
          margin-top: 0;
        }

        .party-block p {
          margin-bottom: 0.75rem;
          color: var(--muted-foreground);
        }

        .clause-block {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
          border-left: 3px solid var(--border);
          transition: border-color 150ms ease-out;
        }

        .clause-block:hover {
          border-left-color: var(--primary);
        }

        .clause-block h4 {
          color: var(--card-foreground);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .whereas-clause {
          font-style: italic;
          margin: 1rem 0;
          padding-left: 1.5rem;
          color: var(--muted-foreground);
          border-left: 2px solid var(--primary);
        }

        .whereas-clause strong {
          color: var(--card-foreground);
          font-weight: 600;
        }

        .terms-block {
          margin: 2rem 0;
          padding: 1.5rem;
          background: var(--muted);
          border-radius: 0.5rem;
        }

        .terms-block h2 {
          color: var(--card-foreground);
          margin-top: 0;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .terms-block ol {
          margin-left: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--muted-foreground);
        }

        .terms-block li {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .terms-block strong {
          color: var(--card-foreground);
          font-weight: 600;
        }

        .scanning-line {
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

        .highlight-clause {
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

        @media print {
          .signature-block,
          .party-block,
          .clause-block,
          .terms-block {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </main>
  );
}
