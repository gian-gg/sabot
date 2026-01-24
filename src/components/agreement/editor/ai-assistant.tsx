'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Check,
  X,
  AlertTriangle,
  Info,
  Sparkles,
  Loader,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AISuggestion } from '@/lib/ai/contract-analyzer';

interface AiAssistantProps {
  editorContent?: string;
}

/**
 * Helper function to strip HTML tags for analysis
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * AI Assistant Component
 * Provides real-time analysis of legal agreements using Gemini AI
 * Features:
 * - Real-time grammar checking
 * - Legal clause suggestions
 * - Risk detection and warnings
 * - Clause explanations
 * - Language simplification
 */
export function AiAssistant({ editorContent = '' }: AiAssistantProps) {
  // State management
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [simplifyingId, setSimplifyingId] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState<
    Record<string, string>
  >({});
  const [simplifiedText, setSimplifiedText] = useState<Record<string, string>>(
    {}
  );

  // Refs for debouncing
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastAnalyzedRef = useRef<string>('');

  /**
   * Call the AI analysis API
   */
  const analyzeDocument = useCallback(async (content: string) => {
    if (!content || content.length < 100) {
      setSuggestions([]);
      setSummary('');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const plainText = stripHtml(content);

      const response = await fetch('/api/agreement/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: plainText,
          type: 'all',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze document');
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Combine all suggestions
        const allSuggestions = [
          ...(result.data.grammar || []),
          ...(result.data.clauses || []),
          ...(result.data.risks || []),
          ...(result.data.improvements || []),
        ];

        setSuggestions(allSuggestions);
        setSummary(result.data.summary || '');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Debounced analysis when editor content changes
   */
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Only analyze if content has meaningfully changed
    if (editorContent !== lastAnalyzedRef.current) {
      debounceTimerRef.current = setTimeout(() => {
        lastAnalyzedRef.current = editorContent;
        analyzeDocument(editorContent);
      }, 2000); // 2 second debounce
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [editorContent, analyzeDocument]);

  /**
   * Explain a clause in simple terms
   */
  const handleExplainClause = async (suggestion: AISuggestion) => {
    if (explanationText[suggestion.id]) {
      // Already have explanation, just toggle visibility
      setExplainingId(explainingId === suggestion.id ? null : suggestion.id);
      return;
    }

    setExplainingId(suggestion.id);

    try {
      const response = await fetch('/api/agreement/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: suggestion.description,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setExplanationText({
          ...explanationText,
          [suggestion.id]: result.explanation,
        });
      }
    } catch {
      toast.error('Failed to explain clause');
      setExplainingId(null);
    }
  };

  /**
   * Simplify language
   */
  const handleSimplifyLanguage = async (suggestion: AISuggestion) => {
    if (simplifiedText[suggestion.id]) {
      setSimplifyingId(simplifyingId === suggestion.id ? null : suggestion.id);
      return;
    }

    setSimplifyingId(suggestion.id);

    try {
      const response = await fetch('/api/agreement/simplify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: suggestion.suggestedText || suggestion.description,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSimplifiedText({
          ...simplifiedText,
          [suggestion.id]: result.simplified,
        });
      }
    } catch {
      toast.error('Failed to simplify language');
      setSimplifyingId(null);
    }
  };

  /**
   * Apply a suggestion (dismiss it)
   */
  const handleApply = (id: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== id));
    toast.success('Suggestion applied');
  };

  /**
   * Dismiss a suggestion without applying
   */
  const handleDismiss = (id: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== id));
  };

  /**
   * Get icon based on severity
   */
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="text-muted-foreground h-4 w-4" />;
    }
  };

  /**
   * Get badge variant based on type
   */
  const getBadgeVariant = (type: string) => {
    if (type === 'risk') return 'destructive';
    if (type === 'clause') return 'secondary';
    return 'secondary';
  };

  /**
   * Suggestion Card Component
   */
  const SuggestionCard = ({ suggestion }: { suggestion: AISuggestion }) => (
    <Card
      className={
        suggestion.type === 'risk'
          ? 'bg-card border-red-500/20 p-4'
          : 'bg-card p-4'
      }
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="flex gap-2">
          <Badge variant={getBadgeVariant(suggestion.type)} className="text-xs">
            {suggestion.severity}
          </Badge>
          {suggestion.location && (
            <Badge variant="secondary" className="text-xs">
              {suggestion.location}
            </Badge>
          )}
        </div>
        {getSeverityIcon(suggestion.severity)}
      </div>

      <h4 className="mb-1 text-sm font-semibold">{suggestion.title}</h4>
      <p className="text-muted-foreground mb-3 text-xs">
        {suggestion.description}
      </p>

      {suggestion.suggestedText && (
        <div className="bg-muted/50 border-border/50 mb-3 rounded border p-2 text-xs">
          <p className="text-muted-foreground mb-1 font-semibold">
            Suggested text:
          </p>
          <p className="text-foreground">{suggestion.suggestedText}</p>
        </div>
      )}

      {/* Explanation section */}
      {explainingId === suggestion.id && explanationText[suggestion.id] && (
        <div className="mb-3 rounded border border-blue-200/50 bg-blue-50 p-2 text-xs">
          <p className="text-blue-900">
            {explanationText[suggestion.id]}
          </p>
        </div>
      )}

      {/* Simplified text section */}
      {simplifyingId === suggestion.id && simplifiedText[suggestion.id] && (
        <div className="mb-3 rounded border border-green-200/50 bg-green-50 p-2 text-xs">
          <p className="text-green-900">
            {simplifiedText[suggestion.id]}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
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
          onClick={() => handleExplainClause(suggestion)}
          className="bg-transparent text-xs"
          title="Get AI explanation of this clause"
        >
          <HelpCircle className="h-3 w-3" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleSimplifyLanguage(suggestion)}
          className="bg-transparent text-xs"
          title="Simplify the language"
        >
          <Lightbulb className="h-3 w-3" />
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
  );

  // Group suggestions by type
  const grammarSuggestions = suggestions.filter((s) => s.type === 'grammar');
  const clauseSuggestions = suggestions.filter((s) => s.type === 'clause');
  const riskSuggestions = suggestions.filter((s) => s.type === 'risk');

  return (
    <aside className="border-border/50 bg-muted/20 flex-1 overflow-y-auto border-l">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          {isLoading && (
            <Loader className="text-primary h-4 w-4 animate-spin" />
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 rounded border border-red-200/50 bg-red-50 p-3 text-xs text-red-900">
            <p className="font-semibold">Analysis Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="mb-4 rounded border border-blue-200/50 bg-blue-50 p-3 text-xs">
            <p className="mb-1 font-semibold text-blue-900">
              Summary
            </p>
            <p className="text-blue-800">{summary}</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && suggestions.length === 0 && !error && (
          <div className="text-muted-foreground py-8 text-center text-sm">
            <Sparkles className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>Start typing to get AI suggestions</p>
            <p className="mt-1 text-xs">
              Analyzing for grammar, clauses, and risks
            </p>
          </div>
        )}

        {/* Tabs for different suggestion types */}
        {suggestions.length > 0 && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
              <TabsTrigger value="grammar" className="text-xs">
                Grammar ({grammarSuggestions.length})
              </TabsTrigger>
              <TabsTrigger value="clauses" className="text-xs">
                Clauses ({clauseSuggestions.length})
              </TabsTrigger>
              <TabsTrigger value="risks" className="text-xs">
                Risks ({riskSuggestions.length})
              </TabsTrigger>
            </TabsList>

            {/* All suggestions */}
            <TabsContent value="all" className="mt-4 space-y-3">
              {suggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </TabsContent>

            {/* Grammar suggestions */}
            <TabsContent value="grammar" className="mt-4 space-y-3">
              {grammarSuggestions.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-xs">
                  No grammar issues found
                </p>
              ) : (
                grammarSuggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))
              )}
            </TabsContent>

            {/* Clause suggestions */}
            <TabsContent value="clauses" className="mt-4 space-y-3">
              {clauseSuggestions.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-xs">
                  No clause improvements suggested
                </p>
              ) : (
                clauseSuggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))
              )}
            </TabsContent>

            {/* Risk suggestions */}
            <TabsContent value="risks" className="mt-4 space-y-3">
              {riskSuggestions.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-xs">
                  No significant risks detected
                </p>
              ) : (
                riskSuggestions.map((suggestion) => (
                  <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </aside>
  );
}

export default AiAssistant;
