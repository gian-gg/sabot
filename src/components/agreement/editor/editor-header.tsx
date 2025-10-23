'use client';

import { Button } from '@/components/ui/button';
import { Save, Download, Loader2, CheckCircle2, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  exportAgreementToPDF,
  generateFileName,
} from '@/lib/pdf/export-agreement';
import { clearDocument } from '@/store/document/documentStore';

interface EditorHeaderProps {
  documentId: string;
  editorTitle?: string;
  editorContent?: string;
  isConnected?: boolean;
}

export function EditorHeader({
  documentId,
  editorTitle = 'Agreement',
  editorContent = '',
  isConnected = true,
}: EditorHeaderProps) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [mouseX, setMouseX] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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

  const handleSave = () => {
    toast.success('Document saved successfully!');
  };

  const handleCancel = () => {
    // Clear the document store
    clearDocument();
    // Navigate back to home
    router.push('/home');
    toast.success('Agreement cancelled and changes discarded');
  };

  return (
    <header className="glass fixed top-0 right-0 left-0 z-50 w-full border-none">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Title with Status Indicator */}
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-green-500" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          )}
          <h1 className="text-foreground text-base font-semibold">
            {editorTitle}
          </h1>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            title="Cancel agreement and discard changes"
            className="text-sm"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            title="Save document"
            className="text-sm"
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            title="Export agreement as PDF"
            className="text-sm"
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>

          <Link href={`/agreement/${documentId}/finalize`}>
            <Button
              variant="ghost"
              size="sm"
              title="Finalize agreement"
              className="text-sm"
            >
              <Check className="mr-2 h-4 w-4" />
              Finalize
            </Button>
          </Link>
        </div>
      </div>

      {/* Mouse-Reactive Border */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg,
            rgba(255,255,255,0.1) 0%,
            rgba(255,255,255,0.1) ${Math.max(0, mouseX - 150)}px,
            rgba(255,255,255,0.6) ${Math.max(0, mouseX - 50)}px,
            rgba(255,255,255,1) ${mouseX}px,
            rgba(255,255,255,0.6) ${mouseX + 50}px,
            rgba(255,255,255,0.1) ${mouseX + 150}px,
            rgba(255,255,255,0.1) 100%
          )`,
          transition: 'background 100ms ease-out',
        }}
      />
    </header>
  );
}
