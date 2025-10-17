'use client';

import { useState } from 'react';
import { EditorHeader } from '@/components/agreement/editor/editor-header';
import { IdeaBlocksPanel } from '@/components/agreement/editor/idea-blocks-panel';
import { CollaborativeEditor } from '@/components/agreement/editor/collaborative-editor';
import { AiAssistant } from '@/components/agreement/editor/ai-assistant';
import { DocumentOutline } from '@/components/agreement/editor/document-outline';
import { SignatureModal } from '@/components/agreement/editor/signature-modal';
import { CommandPalette } from '@/components/agreement/editor/command-palette';

interface EditorLayoutProps {
  documentId: string;
  initialIdeaBlocks: Array<{ id: string; title: string; content: string }>;
}

export function EditorLayout({
  documentId,
  initialIdeaBlocks,
}: EditorLayoutProps) {
  const [rightPanel, setRightPanel] = useState<'ai' | 'outline' | null>('ai');
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const handleReview = () => {
    setIsReviewing(true);
    setTimeout(() => setIsReviewing(false), 3000);
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
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Idea Blocks Panel */}
        <IdeaBlocksPanel ideaBlocks={initialIdeaBlocks} />

        {/* Center: Collaborative Editor */}
        <CollaborativeEditor
          onOpenSignature={() => setIsSignatureOpen(true)}
          isReviewing={isReviewing}
        />

        {/* Right: AI Assistant or Document Outline */}
        {rightPanel === 'ai' && <AiAssistant />}
        {rightPanel === 'outline' && <DocumentOutline />}
      </div>

      <SignatureModal
        open={isSignatureOpen}
        onOpenChange={setIsSignatureOpen}
      />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
