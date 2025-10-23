'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sparkles,
  FileText,
  Save,
  Download,
  CheckCircle2,
  Loader2,
  FileJson,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  exportAgreementToPDF,
  generateFileName,
} from '@/lib/pdf/export-agreement';

interface EditorHeaderProps {
  documentId: string;
  onToggleAI: () => void;
  onToggleOutline: () => void;
  onReview: () => void;
  onOpenTemplateSelector: () => void;
  aiActive: boolean;
  outlineActive: boolean;
  editorTitle?: string;
  editorContent?: string;
}

export function EditorHeader({
  documentId,
  onToggleAI,
  onToggleOutline,
  onReview,
  onOpenTemplateSelector,
  aiActive,
  outlineActive,
  editorTitle = 'Agreement',
  editorContent = '',
}: EditorHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const collaborators = [
    { id: '1', name: 'John Doe', color: '#1DB954' },
    { id: '2', name: 'Jane Smith', color: '#FF6B6B' },
  ];

  const handleExport = async () => {
    if (!editorContent) {
      toast.error('Document is empty. Please add content before exporting.');
      return;
    }

    try {
      setIsExporting(true);
      const fileName = generateFileName(editorTitle);

      await exportAgreementToPDF(editorContent, {
        title: editorTitle,
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
      setIsExporting(false);
    }
  };

  return (
    <header className="border-border/50 bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-foreground text-xl font-bold">
            Partnership <span className="text-primary">Agreement</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenTemplateSelector}
            className="bg-transparent"
            title="Choose a template or start from scratch"
          >
            <FileJson className="mr-2 h-4 w-4" />
            Templates
          </Button>

          <Button
            variant={aiActive ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleAI}
            className={aiActive ? '' : 'bg-transparent'}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>

          <Button
            variant={outlineActive ? 'default' : 'outline'}
            size="sm"
            onClick={onToggleOutline}
            className={outlineActive ? '' : 'bg-transparent'}
          >
            <FileText className="mr-2 h-4 w-4" />
            Outline
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onReview}
            className="bg-transparent"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Review
          </Button>

          <div className="bg-border h-6 w-px" />

          <Button variant="ghost" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            title="Export agreement as PDF"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>

          <Link href={`/agreement/${documentId}/finalize`}>
            <Button size="sm">Finalize Agreement</Button>
          </Link>

          <div className="bg-border h-6 w-px" />

          <div className="flex -space-x-2">
            {collaborators.map((collab) => (
              <Avatar
                key={collab.id}
                className="border-background h-8 w-8 border-2"
              >
                <AvatarFallback style={{ backgroundColor: collab.color }}>
                  {collab.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
