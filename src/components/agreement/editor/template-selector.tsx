'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getAllTemplates,
  getCategorizedTemplates,
  searchTemplates,
  TemplateUtils,
  BLANK_TEMPLATE,
  type Template,
} from '@/lib/templates/template-loader';
import { Search, ChevronRight, Zap } from 'lucide-react';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: Template) => void;
}

export function TemplateSelector({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allTemplates = getAllTemplates();
  const categorizedTemplates = getCategorizedTemplates();
  const categories = Object.keys(categorizedTemplates);

  // Get templates based on search and category
  const filteredTemplates =
    searchQuery.trim() === ''
      ? selectedCategory === 'all'
        ? allTemplates
        : categorizedTemplates[selectedCategory] || []
      : searchTemplates(searchQuery);

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template);
    onOpenChange(false);
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const handleBlankTemplate = () => {
    handleSelectTemplate(BLANK_TEMPLATE);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose a Template</DialogTitle>
          <DialogDescription>
            Select from our curated templates or start from scratch to create
            your agreement
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs for categories */}
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6 space-y-4">
            {/* Blank Template Card (shown at top) */}
            <Card className="border-border/50 hover:border-primary/50 hover:bg-muted/30 cursor-pointer border-2 border-dashed p-4 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    {BLANK_TEMPLATE.name}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {BLANK_TEMPLATE.description}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Badge variant="outline" className="bg-transparent">
                      {TemplateUtils.getCategoryLabel(BLANK_TEMPLATE.category)}
                    </Badge>
                    <Badge
                      className={TemplateUtils.getDifficultyColor(
                        BLANK_TEMPLATE.difficulty
                      )}
                    >
                      {BLANK_TEMPLATE.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBlankTemplate}
                  className="ml-4 shrink-0"
                >
                  Start
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Separator */}
            {filteredTemplates.length > 0 && (
              <div className="text-muted-foreground py-2 text-center text-xs">
                or choose from our templates
              </div>
            )}

            {/* Template Cards */}
            {filteredTemplates.length > 0 ? (
              <div className="space-y-3">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="hover:border-primary/50 hover:bg-card group cursor-pointer border-2 p-4 transition-all"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {template.name}
                          </h3>
                          {template.category === 'business' && (
                            <Zap className="text-primary h-4 w-4" />
                          )}
                        </div>

                        <p className="text-muted-foreground text-sm">
                          {TemplateUtils.generateBlurb(template)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge
                            className={TemplateUtils.getCategoryColor(
                              template.category
                            )}
                          >
                            {TemplateUtils.getCategoryLabel(template.category)}
                          </Badge>
                          <Badge
                            className={TemplateUtils.getDifficultyColor(
                              template.difficulty
                            )}
                          >
                            {template.difficulty}
                          </Badge>
                          <Badge variant="secondary">
                            ⏱️ {template.estimatedTime}
                          </Badge>
                        </div>

                        {/* Pre-filled sections preview */}
                        {template.ideaBlocks &&
                          template.ideaBlocks.length > 0 && (
                            <div className="border-border/30 mt-3 border-t pt-3">
                              <p className="text-muted-foreground mb-2 text-xs">
                                Includes {template.ideaBlocks.length} extra
                                sections:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {template.ideaBlocks
                                  .slice(0, 3)
                                  .map((block) => (
                                    <Badge
                                      key={block.id}
                                      variant="outline"
                                      className="bg-muted/50 text-xs"
                                    >
                                      {block.title.split(' ')[0]}
                                    </Badge>
                                  ))}
                                {template.ideaBlocks.length > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="bg-muted/50 text-xs"
                                  >
                                    +{template.ideaBlocks.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectTemplate(template)}
                        className="group-hover:bg-primary group-hover:text-primary-foreground ml-4 shrink-0"
                      >
                        Use
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No templates found matching your search.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear search and try again
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer info */}
        <div className="border-border/30 mt-6 border-t pt-4">
          <p className="text-muted-foreground text-xs">
            💡 Tip: All templates are customizable. You can edit any section
            after selection.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
