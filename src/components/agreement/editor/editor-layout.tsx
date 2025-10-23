'use client';

import { useRef, useState } from 'react';
import { EditorHeader } from '@/components/agreement/editor/editor-header';
import { IdeaBlocksPanel } from '@/components/agreement/editor/idea-blocks-panel';
import { TiptapEditor } from '@/components/agreement/editor/tiptap-editor';
import { AiAssistant } from '@/components/agreement/editor/ai-assistant';
import { DocumentOutline } from '@/components/agreement/editor/document-outline';
import { SignatureModal } from '@/components/agreement/editor/signature-modal';
import { CommandPalette } from '@/components/agreement/editor/command-palette';
import {
  exportAgreementToPDF,
  generateFileName,
} from '@/lib/pdf/export-agreement';
import { toast } from 'sonner';

interface EditorLayoutProps {
  documentId: string;
  initialIdeaBlocks: Array<{
    id: string;
    title: string;
    content: string;
    template?: string;
  }>;
}

export function EditorLayout({
  documentId,
  initialIdeaBlocks,
}: EditorLayoutProps) {
  const [rightPanel, setRightPanel] = useState<'ai' | 'outline' | null>('ai');
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [editorContent, setEditorContent] = useState<string>('');

  // Combine legal blocks with any initial idea blocks
  const legalBlocks = [
    {
      id: 'legal-sig',
      title: '📝 Signature Block',
      content: 'Signature placeholder for document signing',
      template: 'signature',
    },
    {
      id: 'legal-party',
      title: '👥 Party Information',
      content: 'Details of contracting parties',
      template: 'party',
    },
    {
      id: 'legal-clause',
      title: '📋 Standard Clause',
      content: 'General contract clause with numbering',
      template: 'clause',
    },
    {
      id: 'legal-whereas',
      title: '⚖️ Whereas Clause',
      content: 'Legal preamble statement',
      template: 'whereas',
    },
    {
      id: 'legal-terms',
      title: '⚡ Terms & Conditions',
      content: 'Terms and conditions section',
      template: 'terms',
    },
  ];

  const allIdeaBlocks = [...legalBlocks, ...initialIdeaBlocks];

  const isExportingRef = useRef(false);

  const handleReview = () => {
    setIsReviewing(true);
    setTimeout(() => setIsReviewing(false), 3000);
  };

  const handleExportFromCommand = async () => {
    if (isExportingRef.current) return;

    if (!editorContent) {
      toast.error('Document is empty. Please add content before exporting.');
      return;
    }

    try {
      isExportingRef.current = true;
      const fileName = generateFileName('Partnership Agreement');

      await exportAgreementToPDF(editorContent, {
        title: 'Partnership Agreement',
        fileName,
        includePageNumbers: true,
        includeTimestamp: true,
        documentId,
      });

      toast.success('Agreement exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to export PDF'
      );
    } finally {
      isExportingRef.current = false;
    }
  };

  return (
    <div className="bg-background flex h-screen flex-col">
      <EditorHeader
        documentId={documentId}
        onToggleAI={() => setRightPanel(rightPanel === 'ai' ? null : 'ai')}
        onToggleOutline={() =>
          setRightPanel(rightPanel === 'outline' ? null : 'outline')
        }
        onReview={handleReview}
        aiActive={rightPanel === 'ai'}
        outlineActive={rightPanel === 'outline'}
        editorTitle="Partnership Agreement"
        editorContent={editorContent}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Idea Blocks Panel */}
        <IdeaBlocksPanel ideaBlocks={allIdeaBlocks} />

        {/* Center: TipTap Editor */}
        <TiptapEditor
          documentId={documentId}
          onOpenSignature={() => setIsSignatureOpen(true)}
          isReviewing={isReviewing}
          onContentChange={setEditorContent}
        />

        {/* Right: AI Assistant or Document Outline */}
        {rightPanel === 'ai' && <AiAssistant />}
        {rightPanel === 'outline' && <DocumentOutline />}
      </div>

      <SignatureModal
        open={isSignatureOpen}
        onOpenChange={setIsSignatureOpen}
      />
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onExport={handleExportFromCommand}
      />
    </div>
  );
}
