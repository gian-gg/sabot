'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  BookOpen,
  FileJson,
  Grid3x3,
  Settings,
  GripVertical,
} from 'lucide-react';
// import { AiAssistant } from './ai-assistant'; // Disabled for now - slow AI analysis
import { DocumentOutline } from './document-outline';
import { cn } from '@/lib/utils';

interface MinimalRightSidebarProps {
  editorContent?: string;
  onJumpToClause?: (clauseNumber: string) => void;
  onOpenTemplateSelector?: () => void;
  ideaBlocks?: Array<{
    id: string;
    title: string;
    content: string;
    template?: string;
  }>;
}

export function MinimalRightSidebar({
  editorContent = '',
  onJumpToClause,
  onOpenTemplateSelector,
  ideaBlocks = [],
}: MinimalRightSidebarProps) {
  const [expandedPanel, setExpandedPanel] = useState<string | null>('ai');

  const handleDragStart = (
    e: React.DragEvent,
    block: { id: string; title: string; content: string; template?: string }
  ) => {
    e.dataTransfer.setData('application/json', JSON.stringify(block));
    e.dataTransfer.effectAllowed = 'copy';
    if (block.template) {
      e.dataTransfer.setData('block-template', block.template);
    }
  };

  const togglePanel = (panelId: string) => {
    // Always switch to the panel, never close completely
    setExpandedPanel(panelId);
  };

  const getPanelTitle = () => {
    switch (expandedPanel) {
      case 'templates':
        return 'Templates';
      case 'blocks':
        return 'Idea Blocks';
      case 'ai':
        return 'AI Assistant';
      case 'outline':
        return 'Document Outline';
      case 'more':
        return 'More Options';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Expandable Side Panel (Left of Sidebar) */}
      {expandedPanel && (
        <aside className="border-border bg-secondary/30 fixed top-14 right-20 z-40 flex h-[calc(100vh-56px)] w-[500px] flex-col border-r shadow-lg backdrop-blur-sm">
          <div className="flex h-full flex-col p-4">
            {/* Header */}
            <div className="border-border/50 mb-4 flex items-center border-b pb-3">
              {expandedPanel === 'ai' && (
                <Sparkles className="mr-2 h-4 w-4 text-emerald-500" />
              )}
              {expandedPanel === 'blocks' && (
                <Grid3x3 className="mr-2 h-4 w-4 text-emerald-500" />
              )}
              {expandedPanel === 'templates' && (
                <FileJson className="mr-2 h-4 w-4 text-emerald-500" />
              )}
              {expandedPanel === 'outline' && (
                <BookOpen className="mr-2 h-4 w-4 text-emerald-500" />
              )}
              {expandedPanel === 'more' && (
                <Settings className="mr-2 h-4 w-4 text-emerald-500" />
              )}
              <h3 className="text-foreground text-sm font-semibold">
                {getPanelTitle()}
              </h3>
            </div>

            {/* Panel Content */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {expandedPanel === 'templates' && (
                <>
                  <p className="text-muted-foreground text-xs">
                    Select a template to load into the editor
                  </p>
                  <Button onClick={onOpenTemplateSelector} className="w-full">
                    Browse All Templates
                  </Button>
                </>
              )}

              {expandedPanel === 'blocks' && (
                <>
                  <p className="text-muted-foreground text-xs">
                    Drag blocks into the editor to insert them
                  </p>
                  {ideaBlocks.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                      No idea blocks available
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {ideaBlocks.map((block) => (
                        <div
                          key={block.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, block)}
                          className="border-border/50 hover:bg-accent/50 group relative cursor-move rounded-lg border p-3 pr-8 transition-colors"
                        >
                          <p className="group-hover:text-primary mb-1 text-sm font-semibold transition-colors">
                            {block.title}
                          </p>
                          <p className="text-muted-foreground line-clamp-2 text-xs">
                            {block.content}
                          </p>
                          <GripVertical className="text-muted-foreground/60 group-hover:text-muted-foreground absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2" />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {expandedPanel === 'ai' && (
                <>
                  <p className="text-muted-foreground mb-3 text-xs">
                    AI analysis disabled for testing
                  </p>
                  <div className="flex-1 overflow-y-auto py-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      AI Assistant temporarily disabled to prioritize
                      collaboration testing.
                    </p>
                    <p className="text-muted-foreground mt-4 text-xs">
                      This will be re-enabled as an optional feature in the next
                      phase.
                    </p>
                  </div>
                </>
              )}

              {expandedPanel === 'outline' && (
                <>
                  <p className="text-muted-foreground mb-3 text-xs">
                    Document structure and clauses
                  </p>
                  <div className="flex-1 overflow-y-auto">
                    <DocumentOutline
                      editorContent={editorContent}
                      onJumpToClause={onJumpToClause}
                    />
                  </div>
                </>
              )}

              {expandedPanel === 'more' && (
                <>
                  <p className="text-muted-foreground mb-2 text-xs">
                    Additional options
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Help & Feedback
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Keyboard Shortcuts
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Right Sidebar with Vertical Icon Tabs */}
      <aside className="border-border/50 bg-secondary/20 fixed top-14 right-0 z-50 flex h-[calc(100vh-56px)] w-20 flex-col items-center gap-4 border-l py-4 backdrop-blur-sm">
        {/* Templates Button */}
        <Button
          variant={expandedPanel === 'templates' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => togglePanel('templates')}
          title="Templates"
          className={cn(
            'hover:bg-accent/50 group',
            expandedPanel === 'templates' && 'bg-primary'
          )}
        >
          <FileJson
            className={cn(
              'h-5 w-5 transition-colors',
              expandedPanel === 'templates' && 'text-black',
              'group-hover:text-white'
            )}
          />
        </Button>

        {/* Blocks Button */}
        <Button
          variant={expandedPanel === 'blocks' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => togglePanel('blocks')}
          title="Idea Blocks"
          className={cn(
            'hover:bg-accent/50 group',
            expandedPanel === 'blocks' && 'bg-primary'
          )}
        >
          <Grid3x3
            className={cn(
              'h-5 w-5 transition-colors',
              expandedPanel === 'blocks' && 'text-black',
              'group-hover:text-white'
            )}
          />
        </Button>

        {/* AI Button */}
        <Button
          variant={expandedPanel === 'ai' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => togglePanel('ai')}
          title="AI Assistant"
          className={cn(
            'hover:bg-accent/50 group',
            expandedPanel === 'ai' && 'bg-primary'
          )}
        >
          <Sparkles
            className={cn(
              'h-5 w-5 transition-colors',
              expandedPanel === 'ai' && 'text-black',
              'group-hover:text-white'
            )}
          />
        </Button>

        {/* Outline Button */}
        <Button
          variant={expandedPanel === 'outline' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => togglePanel('outline')}
          title="Document Outline"
          className={cn(
            'hover:bg-accent/50 group',
            expandedPanel === 'outline' && 'bg-primary'
          )}
        >
          <BookOpen
            className={cn(
              'h-5 w-5 transition-colors',
              expandedPanel === 'outline' && 'text-black',
              'group-hover:text-white'
            )}
          />
        </Button>

        {/* More Options */}
        <Button
          variant={expandedPanel === 'more' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => togglePanel('more')}
          title="More Options"
          className={cn(
            'hover:bg-accent/50 group',
            expandedPanel === 'more' && 'bg-primary'
          )}
        >
          <Settings
            className={cn(
              'h-5 w-5 transition-colors',
              expandedPanel === 'more' && 'text-black',
              'group-hover:text-white'
            )}
          />
        </Button>
      </aside>
    </>
  );
}
