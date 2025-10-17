'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OutlineItem {
  id: string;
  title: string;
  level: number;
  children?: OutlineItem[];
}

const mockOutline: OutlineItem[] = [
  {
    id: '1',
    title: 'Partnership Agreement',
    level: 1,
    children: [
      { id: '1.1', title: 'Preamble', level: 2 },
      {
        id: '1.2',
        title: 'Definitions',
        level: 2,
        children: [
          { id: '1.2.1', title: 'Party A', level: 3 },
          { id: '1.2.2', title: 'Party B', level: 3 },
          { id: '1.2.3', title: 'Effective Date', level: 3 },
        ],
      },
      {
        id: '1.3',
        title: 'Terms and Conditions',
        level: 2,
        children: [
          { id: '1.3.1', title: 'Scope of Agreement', level: 3 },
          { id: '1.3.2', title: 'Obligations', level: 3 },
        ],
      },
      { id: '1.4', title: 'Signatures', level: 2 },
    ],
  },
];

function OutlineNode({
  item,
  depth = 0,
}: {
  item: OutlineItem;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div>
      <button
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={cn(
          'hover:bg-accent/50 group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
          depth === 0 && 'text-foreground font-semibold',
          depth === 1 && 'text-foreground/90 text-sm',
          depth === 2 && 'text-muted-foreground text-sm'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren && (
          <span className="text-muted-foreground">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </span>
        )}
        <span className="flex-1">{item.title}</span>
      </button>
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <OutlineNode key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function DocumentOutline() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside className="border-border/30 w-64 overflow-y-auto border-l bg-transparent">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            Document Outline
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {mockOutline.map((item) => (
            <OutlineNode key={item.id} item={item} />
          ))}
        </div>
      </div>
    </aside>
  );
}
