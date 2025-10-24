'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, BookOpen } from 'lucide-react';
// import { AiAssistant } from './ai-assistant'; // Disabled for now - slow AI analysis
import { DocumentOutline } from './document-outline';

interface RightPanelTabsProps {
  editorContent?: string;
  onJumpToClause?: (clauseNumber: string) => void;
}

/**
 * Unified right panel with tabs for:
 * - AI Assistant
 * - Document Outline
 */
export function RightPanelTabs({
  editorContent = '',
  onJumpToClause,
}: RightPanelTabsProps) {
  return (
    <aside className="border-border/50 bg-muted/20 flex w-96 flex-col overflow-y-auto border-l">
      <Tabs defaultValue="ai" className="flex h-full flex-col">
        {/* Tab Headers */}
        <TabsList className="border-border/50 grid w-full grid-cols-2 rounded-none border-b bg-transparent">
          <TabsTrigger value="ai" className="gap-2 rounded-none text-xs">
            <Sparkles className="h-4 w-4" />
            AI
          </TabsTrigger>
          <TabsTrigger value="outline" className="gap-2 rounded-none text-xs">
            <BookOpen className="h-4 w-4" />
            Outline
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="ai" className="m-0 h-full">
            <div className="flex h-full items-center justify-center p-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-2 text-sm">
                  AI Assistant temporarily disabled
                </p>
                <p className="text-muted-foreground text-xs">
                  Testing collaboration features. Will be re-enabled as optional
                  soon.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="outline" className="m-0 h-full">
            <div className="h-full">
              <DocumentOutline
                editorContent={editorContent}
                onJumpToClause={onJumpToClause}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
