'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, ChevronDown, ChevronRight, X } from 'lucide-react';
import type { Template } from '@/lib/templates/template-loader';

interface IdeaBlock {
  id: string;
  title: string;
  content: string;
  template?: string;
}

interface CollapsibleBlocksPanelProps {
  ideaBlocks: IdeaBlock[];
  templates?: Template[];
  onTemplateSelect?: (template: Template) => void;
  onOpenTemplateSelector?: () => void;
}

export function CollapsibleBlocksPanel({
  ideaBlocks,
  templates = [],
  onTemplateSelect,
  onOpenTemplateSelector,
}: CollapsibleBlocksPanelProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    templates: false,
    blocks: true,
  });

  const handleDragStart = (e: React.DragEvent, block: IdeaBlock) => {
    e.dataTransfer.setData('application/json', JSON.stringify(block));
    e.dataTransfer.effectAllowed = 'copy';
    if (block.template) {
      e.dataTransfer.setData('block-template', block.template);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside className="border-border/50 bg-muted/20 flex w-80 flex-col overflow-y-auto border-r">
      <div className="flex-1 space-y-4 p-4">
        {/* Templates Section */}
        <div>
          <button
            onClick={() => toggleSection('templates')}
            className="hover:bg-accent/50 flex w-full items-center justify-between rounded-md px-2 py-2 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.templates ? (
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              ) : (
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              )}
              <h3 className="text-foreground text-sm font-semibold">
                Templates
              </h3>
            </div>
          </button>

          {expandedSections.templates && (
            <div className="mt-2 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenTemplateSelector}
                className="w-full justify-start bg-transparent text-xs"
              >
                + Browse Templates
              </Button>

              {templates.length > 0 && (
                <div className="space-y-1">
                  {templates.slice(0, 3).map((template) => (
                    <div
                      key={template.id}
                      className="bg-accent/30 hover:bg-accent/50 cursor-pointer rounded px-2 py-1 text-xs transition-colors"
                      onClick={() => onTemplateSelect?.(template)}
                      title={template.description}
                    >
                      <p className="truncate font-medium">{template.name}</p>
                    </div>
                  ))}
                  {templates.length > 3 && (
                    <p className="text-muted-foreground px-2 text-xs">
                      +{templates.length - 3} more...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-border/30 border-t" />

        {/* Idea Blocks Section */}
        <div>
          <button
            onClick={() => toggleSection('blocks')}
            className="hover:bg-accent/50 flex w-full items-center justify-between rounded-md px-2 py-2 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSections.blocks ? (
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              ) : (
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              )}
              <h3 className="text-foreground text-sm font-semibold">
                Idea Blocks ({ideaBlocks.length})
              </h3>
            </div>
          </button>

          {expandedSections.blocks && (
            <div className="mt-2 space-y-2">
              {ideaBlocks.length === 0 ? (
                <p className="text-muted-foreground py-3 text-center text-xs">
                  No idea blocks available
                </p>
              ) : (
                ideaBlocks.map((block) => (
                  <Card
                    key={block.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, block)}
                    className="hover:border-primary/50 hover:shadow-primary/10 group bg-card cursor-move p-3 transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="text-muted-foreground group-hover:text-primary mt-0.5 h-4 w-4 flex-shrink-0 transition-colors" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-foreground mb-1 line-clamp-1 text-xs font-semibold">
                          {block.title}
                        </h4>
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                          {block.content}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collapse/Expand All Footer */}
      <div className="border-border/30 border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setExpandedSections({
              templates: false,
              blocks: false,
            })
          }
          className="w-full text-xs"
        >
          <X className="mr-1 h-3 w-3" />
          Collapse All
        </Button>
      </div>
    </aside>
  );
}
