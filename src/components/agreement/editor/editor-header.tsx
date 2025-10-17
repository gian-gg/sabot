'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles, FileText, Save, Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface EditorHeaderProps {
  documentId: string;
  onToggleAI: () => void;
  onToggleOutline: () => void;
  onReview: () => void;
  aiActive: boolean;
  outlineActive: boolean;
}

export function EditorHeader({
  documentId,
  onToggleAI,
  onToggleOutline,
  onReview,
  aiActive,
  outlineActive,
}: EditorHeaderProps) {
  const collaborators = [
    { id: '1', name: 'John Doe', color: '#1DB954' },
    { id: '2', name: 'Jane Smith', color: '#FF6B6B' },
  ];

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

          <Button variant="ghost" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
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
