'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronRight, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  extractClausesFromHTML,
  buildOutlineHierarchy,
  type OutlineItem as ClauseOutlineItem,
} from '@/lib/tiptap/clause-numbering';

interface DocumentOutlineProps {
  editorContent?: string;
  onJumpToClause?: (clauseNumber: string) => void;
}

interface OutlineNodeItem extends ClauseOutlineItem {
  clauseNumber?: string;
}

/**
 * Extract outline structure from HTML content
 * Combines clauses and headings for hierarchical outline
 */
function extractOutlineFromHTML(htmlContent: string): OutlineNodeItem[] {
  if (!htmlContent) return [];

  try {
    const clauses = extractClausesFromHTML(htmlContent);

    if (clauses.length === 0) {
      // No clauses found, try to extract headings
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const headings = doc.querySelectorAll('h1, h2, h3, h4');

      if (headings.length === 0) {
        return [];
      }

      // Convert headings to outline items
      let headingIndex = 0;
      return Array.from(headings).map((heading) => ({
        id: `heading-${headingIndex}`,
        number: '',
        title: heading.textContent || 'Untitled',
        level: parseInt(heading.tagName[1]) - 1,
        position: headingIndex++,
        children: [],
      }));
    }

    // Build hierarchical outline from clauses
    return buildOutlineHierarchy(clauses) as OutlineNodeItem[];
  } catch (error) {
    console.error('Error extracting outline:', error);
    return [];
  }
}

/**
 * Recursive outline node renderer
 */
function OutlineNode({
  item,
  depth = 0,
  onJumpToClause,
}: {
  item: OutlineNodeItem;
  depth?: number;
  onJumpToClause?: (clauseNumber: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const hasChildren = item.children && item.children.length > 0;

  // Format the display title with clause number
  const displayTitle = item.number
    ? `${item.number}. ${item.title}`
    : item.title;

  const handleClick = useCallback(() => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }

    // Jump to clause if click handler provided and clause number exists
    if (onJumpToClause && item.number) {
      onJumpToClause(item.number);
    }
  }, [hasChildren, isExpanded, item.number, onJumpToClause]);

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          'hover:bg-accent/50 group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
          'focus:ring-primary/50 focus:ring-1 focus:outline-none',
          depth === 0 && 'text-foreground font-semibold',
          depth === 1 && 'text-foreground/90 text-sm',
          depth === 2 && 'text-muted-foreground text-sm',
          depth > 2 && 'text-muted-foreground/80 text-xs'
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        title={item.title} // Show full title on hover
      >
        {hasChildren && (
          <span className="text-muted-foreground flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 transition-transform" />
            ) : (
              <ChevronRight className="h-3 w-3 transition-transform" />
            )}
          </span>
        )}
        {!hasChildren && <span className="h-3 w-3" />}

        <span className="flex-1 truncate">{displayTitle}</span>

        {/* Clause number badge */}
        {item.number && (
          <span className="text-muted-foreground ml-auto flex-shrink-0 text-xs opacity-60 group-hover:opacity-100">
            {item.number}
          </span>
        )}
      </button>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && (
        <div className="border-border/20 ml-2 border-l">
          {item.children!.map((child) => (
            <OutlineNode
              key={child.id}
              item={child}
              depth={depth + 1}
              onJumpToClause={onJumpToClause}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Document Outline Component
 * Displays hierarchical outline of clauses and sections with real-time updates
 * Features:
 * - Auto-extracts clauses from editor content
 * - Hierarchical numbering (1, 1.1, 1.2, 2, etc.)
 * - Click to jump to clause
 * - Collapsible/expandable sections
 * - Real-time synchronization with editor changes
 */
export function DocumentOutline({
  editorContent = '',
  onJumpToClause,
}: DocumentOutlineProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Memoize outline extraction to avoid recalculating on every render
  const outline = useMemo(() => {
    return extractOutlineFromHTML(editorContent);
  }, [editorContent]);

  if (!isVisible) return null;

  // Show empty state if no clauses found
  const isEmpty = outline.length === 0;

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
            className="hover:bg-accent h-6 w-6 p-0"
            onClick={() => setIsVisible(false)}
            title="Hide outline"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isEmpty ? (
          <div className="text-muted-foreground px-2 py-6 text-center text-xs">
            <p className="mb-2">No clauses or headings found</p>
            <p className="text-muted-foreground/60 text-xs">
              Add clauses or sections to see the outline here
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {outline.map((item) => (
              <OutlineNode
                key={item.id}
                item={item}
                depth={0}
                onJumpToClause={onJumpToClause}
              />
            ))}

            {/* Statistics footer */}
            <div className="border-border/20 mt-6 border-t pt-4">
              <div className="text-muted-foreground space-y-1 text-xs">
                <p>
                  Total Clauses:{' '}
                  <span className="text-foreground font-semibold">
                    {outline.length}
                  </span>
                </p>
                <p>
                  Max Depth:{' '}
                  <span className="text-foreground font-semibold">
                    {Math.max(0, ...outline.map(getMaxDepth))}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

/**
 * Helper function to get maximum depth of outline tree
 */
function getMaxDepth(item: OutlineNodeItem, currentDepth = 0): number {
  if (!item.children || item.children.length === 0) {
    return currentDepth;
  }

  return Math.max(
    ...item.children.map((child) => getMaxDepth(child, currentDepth + 1))
  );
}

export default DocumentOutline;
