'use client';

import type React from 'react';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool } from 'lucide-react';
import { CursorOverlay } from '@/components/agreement/editor/cursor-overlay';

interface CollaborativeEditorProps {
  onOpenSignature: () => void;
  isReviewing: boolean;
}

export function CollaborativeEditor({
  onOpenSignature,
  isReviewing,
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(`
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
  `);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const blockData = e.dataTransfer.getData('application/json');
    if (blockData) {
      const block = JSON.parse(blockData);
      const newContent = `<h2>${block.title}</h2><p>${block.content}</p>`;
      setContent(content + newContent);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <main className="bg-background relative flex-1 overflow-y-auto">
      {isReviewing && (
        <div className="pointer-events-none absolute inset-0 z-50">
          <div className="bg-primary/5 absolute inset-0" />
          <div className="scanning-line" />
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

          {/* Editor Content */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none focus:outline-none"
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: content }}
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
          />
        </Card>
      </div>
    </main>
  );
}
