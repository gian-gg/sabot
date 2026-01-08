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
  onComplete: _onComplete, // Keep for interface compatibility but don't use
}: ProjectQuestionnaireProps) {
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentUserSubmitted, setCurrentUserSubmitted] = useState(false);

  const { status } = useAgreementStatus(agreementId);

  // Trigger transition when both parties have submitted prompts and AI generation is complete
  useEffect(() => {
    if (currentUserSubmitted && status?.both_submitted_idea_blocks) {
      console.log('✅ Ready to proceed to editor');
    }
  }, [currentUserSubmitted, status?.both_submitted_idea_blocks]);

  // Remove all the complex event listeners and polling - let parent handle transitions

  const handleSubmit = async () => {
    console.log('🚀 [ProjectQuestionnaire] Starting prompt submission:', {
      agreementId,
      promptLength: response.length,
      timestamp: new Date().toISOString(),
    });

    setIsGenerating(true);

    try {
      // Send prompt directly for AI generation and idea block creation
      console.log('📤 [ProjectQuestionnaire] Sending prompt to API...');
      const generateResponse = await fetch(
        `/api/agreement/${agreementId}/generate-with-prompts`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userPrompt: response }),
        }
      );

      console.log(
        '📥 [ProjectQuestionnaire] API response status:',
        generateResponse.status
      );

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => ({}));
        console.error('❌ [ProjectQuestionnaire] API error:', errorData);
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const generatedData = await generateResponse.json();
      console.log(
        '🔍 [ProjectQuestionnaire] Raw API response:',
        JSON.stringify(generatedData, null, 2)
      );
      console.log('📊 [ProjectQuestionnaire] Generated data received:', {
        bothPromptsReceived: generatedData.bothPromptsReceived,
        hasIdeaBlocks: !!generatedData.ideaBlocks,
        ideaBlocksCount: generatedData.ideaBlocks?.length || 0,
        shouldProceedToEditor: generatedData.shouldProceedToEditor,
        fallback: generatedData.fallback,
        waitingFor: generatedData.waitingFor,
      });

      // If both prompts were submitted, we have AI-generated content
      if (generatedData.bothPromptsReceived && generatedData.ideaBlocks) {
        console.log(
          '🤖 [ProjectQuestionnaire] Both prompts received! Submitting AI-generated content:',
          {
            ideaBlocksCount: generatedData.ideaBlocks.length,
            combinedPrompt:
              generatedData.combinedPrompt?.substring(0, 100) + '...',
          }
        );

        // Submit the AI-generated idea blocks
        const submitResponse = await fetch(
          `/api/agreement/${agreementId}/submit-idea-blocks`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ideaBlocks: generatedData.ideaBlocks }),
          }
        );

        console.log(
          '📤 [ProjectQuestionnaire] Idea blocks submission status:',
          submitResponse.status
        );

        if (!submitResponse.ok) {
          const errorData = await submitResponse.json().catch(() => ({}));
          console.error(
            '❌ [ProjectQuestionnaire] Idea blocks submission failed:',
            errorData
          );
          throw new Error(errorData.error || 'Failed to submit idea blocks');
        }

        const submitData = await submitResponse.json();
        console.log(
          '✅ [ProjectQuestionnaire] Idea blocks submitted successfully:',
          {
            bothSubmitted: submitData.bothSubmitted,
            ideaBlocksCount: submitData.ideaBlocksCount,
          }
        );

        toast.success(
          'AI-generated content ready! Both users can now proceed.'
        );
        setCurrentUserSubmitted(true);

        // Force a status refresh to ensure both users see the update
        console.log(
          '🔄 [ProjectQuestionnaire] Forcing status refresh to trigger transition...'
        );
        const statusResponse = await fetch(
          `/api/agreement/${agreementId}/status`
        );
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('📊 [ProjectQuestionnaire] Status after submission:', {
            bothSubmittedIdeaBlocks: statusData.both_submitted_idea_blocks,
            agreementStatus: statusData.agreement?.status,
          });
        }

        console.log(
          '🎯 [ProjectQuestionnaire] Letting parent page handle navigation based on status changes'
        );
        // Don't call onComplete() here - let the parent page handle navigation
        // based on status changes from useAgreementStatus
      } else {
        // Only one prompt submitted so far, waiting for the other
        toast.success('Input submitted! Waiting for the other party...');
        setCurrentUserSubmitted(true);
      }
    } catch (error) {
      console.error('💥 [ProjectQuestionnaire] Error in submission process:', {
        error: error instanceof Error ? error.message : error,
      });
      toast.error(
        error instanceof Error ? error.message : 'Failed to process submission'
      );
    } finally {
      console.log('🏁 [ProjectQuestionnaire] Submission process completed');
      setIsGenerating(false);
    }
  };

  // Show waiting state if current user submitted but partner hasn't or AI is still generating
  if (currentUserSubmitted && !status?.both_submitted_idea_blocks) {
    console.log('⏳ [ProjectQuestionnaire] Showing waiting state:', {
      currentUserSubmitted,
      bothSubmittedIdeaBlocks: status?.both_submitted_idea_blocks,
      agreementStatus: status?.agreement?.status,
      timestamp: new Date().toISOString(),
    });

    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="text-primary mb-4 h-16 w-16" />
          <h3 className="mb-2 text-xl font-semibold">
            Prompt Submitted Successfully!
          </h3>
          <p className="text-muted-foreground mb-6 text-center">
            Waiting for the other party to submit their prompt...
            <br />
            Once both prompts are received, we&apos;ll generate personalized
            content and proceed to the editor automatically.
          </p>
          <div className="flex items-center gap-2">
            <Loader2 className="text-primary h-5 w-5 animate-spin" />
            <span className="text-muted-foreground text-sm">
              Processing will happen automatically - no action needed
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
            Describe your project or agreement needs. Once both parties submit
            their inputs, we&apos;ll use AI to generate personalized content
            instantly for your collaboration.
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
              Processing with AI...
            </>
          ) : currentUserSubmitted ? (
            'Submitted'
          ) : (
            <>Submit Your Input</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
