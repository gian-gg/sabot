// AI Assistant Component
// Collapsible sidebar with grammar, clause suggestions, and risk warnings

import type { AISuggestion } from '@/lib/mock-data/agreements';

interface AIAssistantProps {
  suggestions: AISuggestion[];
  isOpen: boolean;
  onToggle: () => void;
  onApplySuggestion?: (suggestionId: string) => void;
  onDismissSuggestion?: (suggestionId: string) => void;
}

export default function AIAssistant({
  suggestions,
  isOpen,
  onToggle,
  onApplySuggestion,
  onDismissSuggestion,
}: AIAssistantProps) {
  // TODO: Replace with v0-generated component
  const grammarSuggestions = suggestions.filter((s) => s.type === 'grammar');
  const clauseSuggestions = suggestions.filter((s) => s.type === 'clause');
  const riskWarnings = suggestions.filter((s) => s.type === 'risk');

  return (
    <div
      style={{
        width: isOpen ? '300px' : '0',
        transition: 'width 200ms',
        overflow: 'hidden',
        borderLeft: '1px solid #282828',
        backgroundColor: '#181818',
      }}
    >
      <button onClick={onToggle}>
        {isOpen ? 'Close' : 'Open'} AI Assistant
      </button>
      {isOpen && (
        <div style={{ padding: '16px' }}>
          <h3>AI Assistant</h3>

          <section>
            <h4>Grammar ({grammarSuggestions.length})</h4>
            {grammarSuggestions.map((s) => (
              <div key={s.id}>
                <p>{s.title}</p>
                {onApplySuggestion && (
                  <button onClick={() => onApplySuggestion(s.id)}>Apply</button>
                )}
              </div>
            ))}
          </section>

          <section>
            <h4>Suggestions ({clauseSuggestions.length})</h4>
            {clauseSuggestions.map((s) => (
              <div key={s.id}>
                <p>{s.title}</p>
                <p>{s.description}</p>
                {onApplySuggestion && (
                  <button onClick={() => onApplySuggestion(s.id)}>Apply</button>
                )}
                {onDismissSuggestion && (
                  <button onClick={() => onDismissSuggestion(s.id)}>
                    Dismiss
                  </button>
                )}
              </div>
            ))}
          </section>

          <section>
            <h4>Risks ({riskWarnings.length})</h4>
            {riskWarnings.map((s) => (
              <div
                key={s.id}
                style={{ border: '2px solid #FFA724', padding: '8px' }}
              >
                <p>⚠️ {s.title}</p>
                <p>{s.description}</p>
              </div>
            ))}
          </section>
        </div>
      )}
    </div>
  );
}
