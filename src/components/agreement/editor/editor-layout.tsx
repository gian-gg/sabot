'use client';

import { useRef, useState, useEffect } from 'react';
import { EditorHeader } from '@/components/agreement/editor/editor-header';
import { MinimalRightSidebar } from '@/components/agreement/editor/minimal-right-sidebar';
import { TiptapEditor } from '@/components/agreement/editor/tiptap-editor';
import { SignatureModal } from '@/components/agreement/editor/signature-modal';
import { CommandPalette } from '@/components/agreement/editor/command-palette';
import { TemplateSelector } from '@/components/agreement/editor/template-selector';
import { CursorOverlay } from '@/components/agreement/editor/cursor-overlay';
import {
  exportAgreementToPDF,
  generateFileName,
} from '@/lib/pdf/export-agreement';
import { type Template } from '@/lib/templates/template-loader';
import { useDocumentStore } from '@/store/document/documentStore';
import { useCollaboration } from '@/lib/collaboration/use-collaboration';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState<string>('');
  const [editorTitle, setEditorTitle] = useState<string>(
    'Partnership Agreement'
  );
  const [currentIdeaBlocks, setCurrentIdeaBlocks] = useState(initialIdeaBlocks);
  const [isConnected, setIsConnected] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showAIErrorModal, setShowAIErrorModal] = useState(false);
  const [templateContent, setTemplateContent] = useState<string | undefined>(
    undefined
  );

  // Get collaboration awareness for cursor tracking
  const { awareness } = useCollaboration({
    documentId,
    enabled: true,
  });

  // Document store
  const { setDocumentId, setTitle, setContent, setIdeaBlocks } =
    useDocumentStore();

  // Sync with document store when content or title changes
  useEffect(() => {
    setDocumentId(documentId);
    setTitle(editorTitle);
    setContent(editorContent);
    setIdeaBlocks(currentIdeaBlocks);
  }, [
    documentId,
    editorTitle,
    editorContent,
    currentIdeaBlocks,
    setDocumentId,
    setTitle,
    setContent,
    setIdeaBlocks,
  ]);

  // Check if AI generation had an error on mount
  useEffect(() => {
    const hasAIError = sessionStorage.getItem('aiGenerationError');
    if (hasAIError === 'true') {
      setShowAIErrorModal(true);
      sessionStorage.removeItem('aiGenerationError');
    }

    // Dismiss any loading toasts from the previous page
    toast.dismiss();
  }, []);

  // Track mouse position and broadcast to awareness
  useEffect(() => {
    if (!awareness) return;

    let lastUpdate = 0;
    const throttleMs = 50;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate < throttleMs) return;

      lastUpdate = now;
      awareness.setLocalStateField('cursor', {
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [awareness]);

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

  const isExportingRef = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleTemplateSelect = (template: Template) => {
    // Update editor title
    setEditorTitle(template.name);

    // Combine legal blocks with template-specific blocks
    const templateBlocks = template.ideaBlocks || [];
    setCurrentIdeaBlocks(templateBlocks);

    // Set template content - this will trigger the TipTap editor to inject it
    setTemplateContent(template.content);

    // Reset template content after a brief delay to allow one-time injection
    setTimeout(() => {
      setTemplateContent(undefined);
    }, 100);

    // Close the template selector
    setTemplateSelectorOpen(false);

    toast.success(`Loaded template: ${template.name}`);
  };

  /**
   * Jump to a specific clause in the editor
   * Called when clicking a clause in the outline
   */
  const handleJumpToClause = (clauseNumber: string) => {
    if (!editorRef.current) return;

    // Find clause element with matching data-number attribute
    const clauseElement = editorRef.current.querySelector(
      `[data-number="${clauseNumber}"]`
    );

    if (clauseElement) {
      // Scroll the clause into view
      clauseElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      // Highlight the clause briefly
      clauseElement.classList.add('highlight-clause');
      setTimeout(() => {
        clauseElement.classList.remove('highlight-clause');
      }, 2000);
    }
  };

  const handleApplySignature = (signatureData: string) => {
    // Store the signature image
    setSignatureImage(signatureData);
    toast.success('Signature applied to document!');
  };

  const handleExportFromCommand = async () => {
    if (isExportingRef.current) return;

    if (!editorContent) {
      toast.error('Document is empty. Please add content before exporting.');
      return;
    }

    try {
      isExportingRef.current = true;
      const fileName = generateFileName(editorTitle);

      await exportAgreementToPDF(editorContent, {
        title: editorTitle,
        fileName,
        includePageNumbers: true,
        includeTimestamp: true,
        documentId,
        signatureImage: signatureImage || undefined,
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
    <div className="bg-background relative flex h-screen flex-col">
      <CursorOverlay awareness={awareness} />
      {/* Simplified Header */}
      <EditorHeader
        documentId={documentId}
        editorTitle={editorTitle}
        editorContent={editorContent}
        isConnected={isConnected}
      />

      {/* Main Layout: Editor + Right Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Center: TipTap Editor */}
        <TiptapEditor
          documentId={documentId}
          isReviewing={false}
          onContentChange={setEditorContent}
          onConnectionStatusChange={setIsConnected}
          onOpenSignature={() => setIsSignatureOpen(true)}
          editorRef={editorRef}
          templateContent={templateContent}
        />

        {/* Right: Minimal Sidebar with Icon Navigation */}
        <MinimalRightSidebar
          editorContent={editorContent}
          onJumpToClause={handleJumpToClause}
          onOpenTemplateSelector={() => setTemplateSelectorOpen(true)}
          ideaBlocks={[...legalBlocks, ...currentIdeaBlocks]}
        />
      </div>

      {/* Modals */}
      <SignatureModal
        open={isSignatureOpen}
        onOpenChange={setIsSignatureOpen}
        onApplySignature={handleApplySignature}
      />
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onExport={handleExportFromCommand}
      />
      <TemplateSelector
        open={templateSelectorOpen}
        onOpenChange={setTemplateSelectorOpen}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* AI Error Modal */}
      <AlertDialog open={showAIErrorModal} onOpenChange={setShowAIErrorModal}>
        <AlertDialogContent>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            AI Generation Unavailable
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <div>
                AI generation encountered an error and fallback blocks were
                used.
              </div>
              <div className="text-sm">
                No worries! You can now edit and complete your agreement
                manually with the provided sections.
              </div>
            </div>
          </AlertDialogDescription>
          <AlertDialogAction onClick={() => setShowAIErrorModal(false)}>
            Got it
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
