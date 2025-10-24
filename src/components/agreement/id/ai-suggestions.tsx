import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Suggestion {
  id: string;
  type: 'risk' | 'grammar' | 'clause' | 'structure' | string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
}

interface AISuggestionsProps {
  suggestions?: Suggestion[];
}

const defaultSuggestions: Suggestion[] = [
  {
    id: '1',
    type: 'risk',
    severity: 'high',
    title: 'Missing Termination Clause',
    description: 'Consider adding a termination clause to protect both parties',
    suggestion:
      'Add a section specifying conditions under which either party can terminate the agreement',
  },
  {
    id: '2',
    type: 'grammar',
    severity: 'low',
    title: 'Grammar Improvement',
    description: 'Section 2.1 contains passive voice that could be more direct',
    suggestion:
      'Change "The services will be provided by Party A" to "Party A will provide the services"',
  },
  {
    id: '3',
    type: 'clause',
    severity: 'medium',
    title: 'Add Confidentiality Clause',
    description: 'Recommended for agreements involving sensitive information',
    suggestion:
      'Include a confidentiality section to protect proprietary information',
  },
  {
    id: '4',
    type: 'structure',
    severity: 'medium',
    title: 'Reorganize Payment Terms',
    description: 'Payment terms could be more clearly structured',
    suggestion:
      'Break down payment terms into: Amount, Schedule, Method, and Late Payment Penalties',
  },
];

const severityConfig = {
  high: {
    icon: AlertCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    badge: 'destructive' as const,
  },
  medium: {
    icon: Info,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    badge: 'secondary' as const,
  },
  low: {
    icon: CheckCircle,
    color: 'text-primary',
    bg: 'bg-primary/10',
    badge: 'outline' as const,
  },
};

export function AISuggestions({ suggestions = [] }: AISuggestionsProps) {
  const displaySuggestions =
    suggestions.length > 0 ? suggestions : defaultSuggestions;
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {displaySuggestions.map((suggestion) => {
          const config =
            severityConfig[suggestion.severity as keyof typeof severityConfig];
          const Icon = config.icon;

          return (
            <div
              key={suggestion.id}
              className="border-border bg-card hover:border-primary/50 rounded-lg border-2 p-5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={cn('rounded-lg p-2', config.bg)}>
                  {React.createElement(Icon, {
                    className: cn('h-5 w-5', config.color),
                  })}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="mb-1 font-semibold">{suggestion.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {suggestion.description}
                      </p>
                    </div>
                    <Badge variant={config.badge}>{suggestion.severity}</Badge>
                  </div>
                  <div className="bg-muted/50 border-border rounded-lg border p-3">
                    <p className="text-sm">{suggestion.suggestion}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default">
                      Apply
                    </Button>
                    <Button size="sm" variant="ghost">
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
