'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';

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
    <Card>
      <CardContent className="space-y-6">
        <Label>What are you building?</Label>
        <Textarea
          placeholder="e.g., A partnership agreement for a software development project between two companies..."
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="min-h-32 resize-none"
        />
        <div className="border-primary/30 bg-primary/10 flex items-center gap-2 rounded-lg border p-3">
          <ShieldCheck className="text-primary h-4 w-4 flex-shrink-0" />
          <p className="text-primary text-xs">
            Tell us about your agreement. We&apos;ll generate personalized idea
            blocks to help you get started.
          </p>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!response.trim() || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? <>Generating Ideas...</> : <>Generate Idea Blocks</>}
        </Button>
      </CardContent>
    </Card>
  );
}
