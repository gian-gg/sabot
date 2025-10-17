'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, AlertTriangle, Info, Sparkles } from 'lucide-react';

const mockSuggestions = [
  {
    id: '1',
    type: 'grammar',
    severity: 'low',
    title: 'Grammar improvement',
    description:
      'Consider changing "shall" to "will" for modern legal writing.',
    location: 'Section 3.1',
  },
  {
    id: '2',
    type: 'suggestion',
    severity: 'medium',
    title: 'Missing clause',
    description:
      'Consider adding a dispute resolution clause to handle potential conflicts.',
    location: 'General',
  },
  {
    id: '3',
    type: 'risk',
    severity: 'high',
    title: 'Ambiguous term',
    description:
      'The term "reasonable time" is vague. Specify an exact timeframe.',
    location: 'Section 2.3',
  },
];

export function AiAssistant() {
  const [suggestions, setSuggestions] = useState(mockSuggestions);

  const handleApply = (id: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== id));
  };

  const handleDismiss = (id: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== id));
  };

  return (
    <aside className="border-border/50 bg-muted/20 w-96 overflow-y-auto border-l">
      <div className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="text-primary h-5 w-5" />
          <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
            AI Assistant
          </h3>
        </div>

        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grammar">Grammar</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
          </TabsList>

          <TabsContent value="grammar" className="mt-4 space-y-3">
            {suggestions
              .filter((s) => s.type === 'grammar')
              .map((suggestion) => (
                <Card key={suggestion.id} className="bg-card p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.location}
                    </Badge>
                    <Info className="text-muted-foreground h-4 w-4" />
                  </div>
                  <h4 className="mb-1 text-sm font-semibold">
                    {suggestion.title}
                  </h4>
                  <p className="text-muted-foreground mb-3 text-xs">
                    {suggestion.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApply(suggestion.id)}
                      className="flex-1"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(suggestion.id)}
                      className="bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="suggestions" className="mt-4 space-y-3">
            {suggestions
              .filter((s) => s.type === 'suggestion')
              .map((suggestion) => (
                <Card key={suggestion.id} className="bg-card p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {suggestion.location}
                    </Badge>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <h4 className="mb-1 text-sm font-semibold">
                    {suggestion.title}
                  </h4>
                  <p className="text-muted-foreground mb-3 text-xs">
                    {suggestion.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApply(suggestion.id)}
                      className="flex-1"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(suggestion.id)}
                      className="bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="risks" className="mt-4 space-y-3">
            {suggestions
              .filter((s) => s.type === 'risk')
              .map((suggestion) => (
                <Card
                  key={suggestion.id}
                  className="bg-card border-red-500/20 p-4"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="destructive" className="text-xs">
                      {suggestion.location}
                    </Badge>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <h4 className="mb-1 text-sm font-semibold">
                    {suggestion.title}
                  </h4>
                  <p className="text-muted-foreground mb-3 text-xs">
                    {suggestion.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApply(suggestion.id)}
                      className="flex-1"
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(suggestion.id)}
                      className="bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  );
}
