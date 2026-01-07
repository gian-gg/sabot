'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { useAgreementStatus } from '@/hooks/useAgreementStatus';
import { toast } from 'sonner';

interface ProjectQuestionnaireProps {
  agreementId: string;
  onComplete: () => void;
}

export function ProjectQuestionnaire({
  agreementId,
  onComplete,
}: ProjectQuestionnaireProps) {
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUserSubmitted, setCurrentUserSubmitted] = useState(false);

  const { status } = useAgreementStatus(agreementId);

  // Trigger transition when both parties have submitted idea blocks
  useEffect(() => {
    if (currentUserSubmitted && status?.both_submitted_idea_blocks) {
      console.log('Both submitted idea blocks! Proceeding to editor...');
      toast.success(
        'Both parties submitted idea blocks! Proceeding to editor...'
      );
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [currentUserSubmitted, status?.both_submitted_idea_blocks, onComplete]);

  const handleSubmit = async () => {
    setIsGenerating(true);

    try {
      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate idea blocks based on response
      const generatedBlocks = [
        {
          id: `${Date.now()}-1`,
          title: 'Purpose & Scope',
          content: `This agreement establishes the framework for ${response.toLowerCase()}. The parties agree to collaborate in good faith to achieve the stated objectives.`,
        },
        {
          id: `${Date.now()}-2`,
          title: 'Key Obligations',
          content:
            'Each party shall fulfill their respective obligations as outlined in this section, including timely delivery of services and adherence to quality standards.',
        },
        {
          id: `${Date.now()}-3`,
          title: 'Payment Terms',
          content:
            'Payment shall be made according to the schedule outlined herein. All amounts are due within 30 days of invoice date unless otherwise specified.',
        },
        {
          id: `${Date.now()}-4`,
          title: 'Confidentiality',
          content:
            'Both parties agree to maintain confidentiality of all proprietary information shared during the course of this agreement.',
        },
        {
          id: `${Date.now()}-5`,
          title: 'Termination Clause',
          content:
            'Either party may terminate this agreement with 30 days written notice. Upon termination, all outstanding obligations must be fulfilled.',
        },
      ];

      // Submit idea blocks to API
      const submitResponse = await fetch(
        `/api/agreement/${agreementId}/submit-idea-blocks`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ideaBlocks: generatedBlocks }),
        }
      );

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit idea blocks');
      }

      const data = await submitResponse.json();

      toast.success('Idea blocks submitted successfully!');
      setCurrentUserSubmitted(true);

      // If both submitted, move to next step
      if (data.bothSubmitted) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    } catch (error) {
      console.error('Error generating/submitting idea blocks:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to generate idea blocks'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Show waiting state if current user submitted but partner hasn't
  if (currentUserSubmitted && !status?.both_submitted_idea_blocks) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="text-primary mb-4 h-16 w-16" />
          <h3 className="mb-2 text-xl font-semibold">
            Idea Blocks Submitted Successfully!
          </h3>
          <p className="text-muted-foreground mb-6 text-center">
            Waiting for the other party to submit their idea blocks...
          </p>
          <div className="flex items-center gap-2">
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
            <span className="text-muted-foreground text-sm">
              We&apos;ll automatically proceed once both parties have submitted
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          disabled={!response.trim() || isGenerating || currentUserSubmitted}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Ideas...
            </>
          ) : currentUserSubmitted ? (
            'Submitted'
          ) : (
            <>Generate Idea Blocks</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
