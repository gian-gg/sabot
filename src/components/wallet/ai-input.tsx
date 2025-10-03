'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function AiInput() {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle AI query submission
    console.log('Query:', query);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={handleSubmit} className="relative">
        <div className="bg-card border-primary/20 hover:border-primary/40 focus-within:border-primary relative flex items-center gap-2 rounded-2xl border-2 p-2 shadow-lg transition-colors focus-within:shadow-xl">
          <div className="pl-3">
            <Sparkles className="text-primary h-5 w-5" />
          </div>

          <Input
            type="text"
            placeholder="Ask me anything... 'How much did I spend on groceries?' or 'Show my monthly savings'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="placeholder:text-muted-foreground flex-1 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <Button type="submit" size="lg" className="gap-2 rounded-xl px-6">
            Ask AI
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Quick Suggestions */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {[
          'Show my spending trends',
          'Budget for next month',
          'Largest expenses this week',
          'Investment performance',
        ].map((suggestion) => (
          <Button
            key={suggestion}
            variant="outline"
            size="sm"
            className="rounded-full bg-transparent text-xs"
            onClick={() => setQuery(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
