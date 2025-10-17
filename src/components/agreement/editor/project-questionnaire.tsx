'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';

interface ProjectQuestionnaireProps {
  onComplete: (
    blocks: Array<{ id: string; title: string; content: string }>
  ) => void;
}

export function ProjectQuestionnaire({
  onComplete,
}: ProjectQuestionnaireProps) {
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async () => {
    setIsGenerating(true);

    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate idea blocks based on response
    const generatedBlocks = [
      {
        id: '1',
        title: 'Purpose & Scope',
        content: `This agreement establishes the framework for ${response.toLowerCase()}. The parties agree to collaborate in good faith to achieve the stated objectives.`,
      },
      {
        id: '2',
        title: 'Key Obligations',
        content:
          'Each party shall fulfill their respective obligations as outlined in this section, including timely delivery of services and adherence to quality standards.',
      },
      {
        id: '3',
        title: 'Payment Terms',
        content:
          'Payment shall be made according to the schedule outlined herein. All amounts are due within 30 days of invoice date unless otherwise specified.',
      },
      {
        id: '4',
        title: 'Confidentiality',
        content:
          'Both parties agree to maintain confidentiality of all proprietary information shared during the course of this agreement.',
      },
      {
        id: '5',
        title: 'Termination Clause',
        content:
          'Either party may terminate this agreement with 30 days written notice. Upon termination, all outstanding obligations must be fulfilled.',
      },
    ];

    onComplete(generatedBlocks);
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <Card className="border-border/50 w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">What are you building?</CardTitle>
          <CardDescription>
            Tell us about your agreement. We&apos;ll generate personalized idea
            blocks to help you get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., A partnership agreement for a software development project between two companies..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="min-h-32 resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!response.trim() || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Idea Blocks
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
