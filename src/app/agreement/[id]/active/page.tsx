'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getAgreementById } from '@/lib/mock-data/agreements';
import CollaborativeEditor from '@/components/agreement/editor/collaborative-editor';
import CursorOverlay from '@/components/agreement/editor/cursor-overlay';
import AIAssistant from '@/components/agreement/editor/ai-assistant';
import TypingIndicator from '@/components/agreement/editor/typing-indicator';
// TODO: Import Button, Avatar components from shadcn/ui

export default function ActiveAgreementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  const agreement = getAgreementById(id);

  if (!agreement) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div>
          <p>Agreement not found</p>
          <Link href={ROUTES.HOME.ROOT}>Go Home</Link>
        </div>
      </div>
    );
  }

  // Mock cursor positions for demonstration
  const mockCursors = agreement.parties.map((party, index) => ({
    userId: party.id,
    x: 100 + index * 200,
    y: 150 + index * 50,
    name: party.name,
    color: party.color,
  }));

  // Mock typing state
  const otherParty = agreement.parties.find((p) => p.id !== '1'); // Assume current user is '1'

  const handleReadyToFinalize = () => {
    router.push(ROUTES.AGREEMENT.FINALIZE(id));
  };

  return (
    <div className="bg-background min-h-screen">
      {/* TODO: Replace with v0-generated header */}
      <header className="border-border/50 bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.AGREEMENT.VIEW(id)}
              className="flex items-center gap-2"
            >
              <span>← Back to Overview</span>
            </Link>
            <div className="bg-border h-6 w-px" />
            <h1>{agreement.title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Party avatars */}
            {agreement.parties.map((party) => (
              <div key={party.id} className="flex items-center gap-2">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: party.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                  }}
                >
                  {party.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                {party.isOnline && <span>●</span>}
              </div>
            ))}

            <button onClick={() => setAiAssistantOpen(!aiAssistantOpen)}>
              AI Assistant
            </button>
            <button onClick={handleReadyToFinalize}>Ready to Finalize</button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Editor area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Typing indicator */}
          {otherParty && (
            <TypingIndicator
              userName={otherParty.name}
              userColor={otherParty.color}
              isTyping={otherParty.isOnline || false}
            />
          )}

          {/* Collaborative editor */}
          <CollaborativeEditor
            blocks={agreement.sections}
            parties={agreement.parties}
            onBlockChange={(blockId, content) =>
              console.log('Block changed:', blockId, content)
            }
          />

          {/* Cursor overlay */}
          <CursorOverlay cursors={mockCursors} />
        </div>

        {/* AI Assistant sidebar */}
        <AIAssistant
          suggestions={agreement.aiSuggestions}
          isOpen={aiAssistantOpen}
          onToggle={() => setAiAssistantOpen(!aiAssistantOpen)}
          onApplySuggestion={(id) => console.log('Apply suggestion:', id)}
          onDismissSuggestion={(id) => console.log('Dismiss suggestion:', id)}
        />
      </div>
    </div>
  );
}
