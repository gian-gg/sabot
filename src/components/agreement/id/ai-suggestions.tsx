// AI Suggestions Component
// Displays AI-generated recommendations and risk warnings

import type { AISuggestion } from '@/lib/mock-data/agreements';

interface AISuggestionsProps {
  suggestions: AISuggestion[];
  onApply?: (suggestionId: string) => void;
  onDismiss?: (suggestionId: string) => void;
}

export default function AISuggestions({
  suggestions,
  onApply,
  onDismiss,
}: AISuggestionsProps) {
  // TODO: Replace with v0-generated component
  return (
    <div>
      <h3>AI Recommendations</h3>
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          style={{
            border:
              suggestion.severity === 'high'
                ? '2px solid red'
                : suggestion.severity === 'medium'
                  ? '2px solid yellow'
                  : '1px solid gray',
          }}
        >
          <h4>{suggestion.title}</h4>
          <p>Type: {suggestion.type}</p>
          <p>Severity: {suggestion.severity}</p>
          <p>{suggestion.description}</p>
          {suggestion.suggestedText && (
            <p>Suggested: {suggestion.suggestedText}</p>
          )}
          {onApply && (
            <button onClick={() => onApply(suggestion.id)}>
              Apply Suggestion
            </button>
          )}
          {onDismiss && (
            <button onClick={() => onDismiss(suggestion.id)}>Dismiss</button>
          )}
        </div>
      ))}
    </div>
  );
}
