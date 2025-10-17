'use client';

import type React from 'react';

import { Card } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';

interface IdeaBlock {
  id: string;
  title: string;
  content: string;
}

interface IdeaBlocksPanelProps {
  ideaBlocks: IdeaBlock[];
}

export function IdeaBlocksPanel({ ideaBlocks }: IdeaBlocksPanelProps) {
  const handleDragStart = (e: React.DragEvent, block: IdeaBlock) => {
    e.dataTransfer.setData('application/json', JSON.stringify(block));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <aside className="border-border/50 bg-muted/20 w-80 overflow-y-auto border-r">
      <div className="p-4">
        <h3 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wide uppercase">
          Idea Blocks
        </h3>
        <div className="space-y-3">
          {ideaBlocks.map((block) => (
            <Card
              key={block.id}
              draggable
              onDragStart={(e) => handleDragStart(e, block)}
              className="hover:border-primary/50 hover:shadow-primary/10 group bg-card cursor-move p-4 transition-all hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <GripVertical className="text-muted-foreground group-hover:text-primary mt-0.5 h-5 w-5 flex-shrink-0 transition-colors" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-foreground mb-1 text-sm font-semibold">
                    {block.title}
                  </h4>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {block.content}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </aside>
  );
}
