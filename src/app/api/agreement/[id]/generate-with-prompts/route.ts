import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface IdeaBlock {
  id?: string;
  title: string;
  content: string;
}

// In-memory storage for prompts (temporary, per agreement)
const pendingPrompts = new Map<
  string,
  { userId: string; prompt: string; timestamp: number }[]
>();

// Clean up old prompts (older than 30 minutes)
const cleanupOldPrompts = () => {
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  for (const [agreementId, prompts] of pendingPrompts.entries()) {
    const validPrompts = prompts.filter((p) => p.timestamp > thirtyMinutesAgo);
    if (validPrompts.length === 0) {
      pendingPrompts.delete(agreementId);
    } else if (validPrompts.length !== prompts.length) {
      pendingPrompts.set(agreementId, validPrompts);
    }
  }
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let agreementId = '';

  try {
    const { userPrompt } = await request.json();
    const { id: id_param } = await params;
    agreementId = id_param;

    console.log('🚀 [GenerateWithPrompts] API called:', {
      agreementId,
      hasPrompt: !!userPrompt,
      promptLength: userPrompt?.length || 0,
      timestamp: new Date().toISOString(),
    });

    if (!userPrompt?.trim()) {
      console.error('❌ [GenerateWithPrompts] No prompt provided');
      return NextResponse.json(
        { error: 'User prompt is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log('👤 [GenerateWithPrompts] User authentication:', {
      userId: user?.id,
      userError: userError?.message,
      authenticated: !!user,
    });

    if (userError || !user) {
      console.error(
        '❌ [GenerateWithPrompts] Authentication failed:',
        userError?.message
      );
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get agreement and verify access
    console.log(
      '🔍 [GenerateWithPrompts] Looking for agreement with ID:',
      agreementId
    );
    const { data: agreement, error: agreementError } = await supabase
      .from('agreements')
      .select('creator_id, status')
      .eq('id', agreementId)
      .single();

    console.log('📋 [GenerateWithPrompts] Agreement query result:', {
      found: !!agreement,
      creatorId: agreement?.creator_id,
      status: agreement?.status,
      error: agreementError?.message,
    });

    if (agreementError || !agreement) {
      console.error(
        '❌ [GenerateWithPrompts] Agreement lookup failed:',
        agreementError
      );
      return NextResponse.json(
        { error: 'Agreement not found', details: agreementError?.message },
        { status: 404 }
      );
    }

    // Get participants to find creator and invitee
    console.log('👥 [GenerateWithPrompts] Getting participants...');
    const { data: participants, error: participantsError } = await supabase
      .from('agreement_participants')
      .select('user_id, role')
      .eq('agreement_id', agreementId);

    console.log('👥 [GenerateWithPrompts] Participants query result:', {
      participantCount: participants?.length || 0,
      participants: participants?.map((p) => ({
        userId: p.user_id,
        role: p.role,
      })),
      error: participantsError?.message,
    });

    if (participantsError) {
      console.error(
        '❌ [GenerateWithPrompts] Participants lookup failed:',
        participantsError
      );
      return NextResponse.json(
        { error: 'Failed to get participants' },
        { status: 500 }
      );
    }

    const invitee = participants?.find((p) => p.role === 'invitee');

    const isCreator = user.id === agreement.creator_id;
    const isInvitee = participants?.some(
      (p) => p.user_id === user.id && p.role === 'invitee'
    );

    console.log('🔐 [GenerateWithPrompts] Access control:', {
      userId: user.id,
      creatorId: agreement.creator_id,
      inviteeId: invitee?.user_id,
      isCreator,
      isInvitee,
      hasAccess: isCreator || isInvitee,
    });

    if (!isCreator && !isInvitee) {
      console.error(
        '❌ [GenerateWithPrompts] Access denied for user:',
        user.id
      );
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Clean up old prompts first
    cleanupOldPrompts();

    // Get or create prompts array for this agreement
    if (!pendingPrompts.has(agreementId)) {
      pendingPrompts.set(agreementId, []);
    }

    const prompts = pendingPrompts.get(agreementId)!;

    console.log('💾 [GenerateWithPrompts] Current prompts state:', {
      agreementId,
      existingPromptsCount: prompts.length,
      existingPrompts: prompts.map((p) => ({
        userId: p.userId,
        promptLength: p.prompt.length,
        timestamp: p.timestamp,
      })),
    });

    // Remove any existing prompt from this user and add the new one
    const filteredPrompts = prompts.filter((p) => p.userId !== user.id);
    filteredPrompts.push({
      userId: user.id,
      prompt: userPrompt.trim(),
      timestamp: Date.now(),
    });

    pendingPrompts.set(agreementId, filteredPrompts);

    console.log('💾 [GenerateWithPrompts] Updated prompts state:', {
      agreementId,
      totalPromptsCount: filteredPrompts.length,
      prompts: filteredPrompts.map((p) => ({
        userId: p.userId,
        promptLength: p.prompt.length,
      })),
    });

    // Check if we have prompts from both parties
    const creatorPrompt = filteredPrompts.find(
      (p) => p.userId === agreement.creator_id
    );
    const inviteePrompt = invitee
      ? filteredPrompts.find((p) => p.userId === invitee.user_id)
      : null;

    console.log('🔍 [GenerateWithPrompts] Checking prompt completeness:', {
      hasCreatorPrompt: !!creatorPrompt,
      hasInviteePrompt: !!inviteePrompt,
      creatorId: agreement.creator_id,
      inviteeId: invitee?.user_id,
      bothPromptsReady: !!(creatorPrompt && inviteePrompt),
    });

    if (creatorPrompt && inviteePrompt) {
      // Both prompts received - generate with Gemini AI
      console.log(
        '🤖 [GenerateWithPrompts] Both prompts received, generating with AI...',
        {
          creatorPromptLength: creatorPrompt.prompt.length,
          inviteePromptLength: inviteePrompt.prompt.length,
          timestamp: new Date().toISOString(),
        }
      );

      try {
        // Initialize Gemini AI
        console.log('🧠 [GenerateWithPrompts] Initializing Gemini AI...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
        });

        // Combine prompts and generate content
        const combinedPrompt = `
You are an expert legal document generator. Based on the following two descriptions from both parties of a collaboration, generate 5 structured idea blocks for their agreement.

Party A Input: "${creatorPrompt.prompt}"

Party B Input: "${inviteePrompt.prompt}"

Please generate 5 comprehensive idea blocks that cover the essential aspects of their collaboration. Each block should have a title and detailed content that addresses both parties' needs.

Return the response as a JSON object with this exact structure:
{
  "ideaBlocks": [
    {
      "id": "unique-id-1",
      "title": "Block Title",
      "content": "Detailed content for this section..."
    }
  ]
}

Focus on these key areas:
1. Purpose & Scope of the collaboration
2. Roles & Responsibilities of each party
3. Timeline & Deliverables
4. Payment/Compensation Terms
5. Legal & Risk Management (confidentiality, termination, etc.)

Make the content specific to their inputs and professionally written.`;

        console.log('🚀 [GenerateWithPrompts] Sending request to Gemini AI...');
        const result = await model.generateContent(combinedPrompt);
        const response = await result.response;
        const generatedText = response.text();

        console.log('📥 [GenerateWithPrompts] Gemini AI response received:', {
          responseLength: generatedText.length,
          preview: generatedText.substring(0, 200) + '...',
        });

        // Parse the JSON response from Gemini
        let parsedResponse;
        try {
          // Remove any markdown formatting if present
          const cleanedText = generatedText
            .replace(/```json\n?|```\n?/g, '')
            .trim();
          parsedResponse = JSON.parse(cleanedText);
          console.log(
            '✅ [GenerateWithPrompts] Successfully parsed Gemini response:',
            {
              ideaBlocksCount: parsedResponse?.ideaBlocks?.length || 0,
            }
          );
        } catch (parseError) {
          console.error(
            '⚠️ [GenerateWithPrompts] Failed to parse Gemini response, using fallback:',
            parseError
          );

          // Fallback: create structured response from the text
          parsedResponse = {
            ideaBlocks: [
              {
                id: `${Date.now()}-1`,
                title: 'AI-Generated Agreement Framework',
                content: generatedText,
              },
            ],
          };
        }

        // Ensure all blocks have proper IDs
        if (
          parsedResponse.ideaBlocks &&
          Array.isArray(parsedResponse.ideaBlocks)
        ) {
          parsedResponse.ideaBlocks = parsedResponse.ideaBlocks.map(
            (block: IdeaBlock, index: number) => ({
              ...block,
              id: block.id || `${Date.now()}-${index + 1}`,
            })
          );
        }

        // Clean up the prompts since we've used them
        console.log(
          '🧹 [GenerateWithPrompts] Cleaning up prompts from memory for agreement:',
          agreementId
        );
        pendingPrompts.delete(agreementId);

        // Broadcast the completion event to all participants with idea blocks
        console.log(
          '📡 [GenerateWithPrompts] Broadcasting AI generation complete event with idea blocks...'
        );
        await supabase.channel(`agreement:${agreementId}`).send({
          type: 'broadcast',
          event: 'ai_generation_complete',
          payload: {
            agreementId,
            success: true,
            ideaBlocks: parsedResponse.ideaBlocks || [],
          },
        });

        // Also broadcast idea_blocks_submitted event since we're about to submit them
        console.log(
          '📡 [GenerateWithPrompts] Broadcasting idea blocks submitted event...'
        );
        await supabase.channel(`agreement:${agreementId}`).send({
          type: 'broadcast',
          event: 'idea_blocks_submitted',
          payload: { agreementId, bothSubmitted: true },
        });

        console.log(
          '✅ [GenerateWithPrompts] AI generation completed successfully!',
          {
            ideaBlocksCount: parsedResponse.ideaBlocks?.length || 0,
            combinedPromptLength:
              `${creatorPrompt.prompt} | ${inviteePrompt.prompt}`.length,
          }
        );

        return NextResponse.json({
          success: true,
          bothPromptsReceived: true,
          ideaBlocks: parsedResponse.ideaBlocks || [],
          combinedPrompt: `${creatorPrompt.prompt} | ${inviteePrompt.prompt}`,
          shouldProceedToEditor: true,
        });
      } catch (genError) {
        console.error(
          '❌ [GenerateWithPrompts] Gemini generation error:',
          genError
        );

        // Create basic fallback blocks so users can still proceed
        const fallbackBlocks = [
          {
            id: `${Date.now()}-1`,
            title: 'Agreement Section 1',
            content:
              'This section is pending AI-generated content. Please fill in the details based on your agreement.',
          },
          {
            id: `${Date.now()}-2`,
            title: 'Agreement Section 2',
            content:
              'This section is pending AI-generated content. Please fill in the details based on your agreement.',
          },
          {
            id: `${Date.now()}-3`,
            title: 'Agreement Section 3',
            content:
              'This section is pending AI-generated content. Please fill in the details based on your agreement.',
          },
          {
            id: `${Date.now()}-4`,
            title: 'Agreement Section 4',
            content:
              'This section is pending AI-generated content. Please fill in the details based on your agreement.',
          },
          {
            id: `${Date.now()}-5`,
            title: 'Agreement Section 5',
            content:
              'This section is pending AI-generated content. Please fill in the details based on your agreement.',
          },
        ];

        // Clean up the prompts
        pendingPrompts.delete(agreementId);

        // Broadcast completion event so both users can proceed
        await supabase.channel(`agreement:${agreementId}`).send({
          type: 'broadcast',
          event: 'ai_generation_complete',
          payload: {
            agreementId,
            success: false,
            hasError: true,
            ideaBlocks: fallbackBlocks,
          },
        });

        return NextResponse.json({
          success: true,
          bothPromptsReceived: true,
          ideaBlocks: fallbackBlocks,
          hasError: true,
          errorMessage:
            'AI generation temporarily unavailable. You can still edit and complete your agreement.',
          shouldProceedToEditor: true,
        });
      }
    } else {
      // Only one prompt so far, waiting for the other party
      console.log(
        '⏳ [GenerateWithPrompts] Only one prompt received, waiting for other party:',
        {
          agreementId,
          currentUserId: user.id,
          isCreator,
          isInvitee,
          waitingFor: isCreator ? 'invitee' : 'creator',
          totalPromptsReceived: filteredPrompts.length,
        }
      );

      // Broadcast that a prompt was submitted
      console.log(
        '📡 [GenerateWithPrompts] Broadcasting prompt submitted event...'
      );
      await supabase.channel(`agreement:${agreementId}`).send({
        type: 'broadcast',
        event: 'prompt_submitted',
        payload: { agreementId, userId: user.id },
      });

      return NextResponse.json({
        success: true,
        bothPromptsReceived: false,
        waitingFor: isCreator ? 'invitee' : 'creator',
      });
    }
  } catch (error) {
    console.error('💥 [GenerateWithPrompts] Error in generate-with-prompts:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      agreementId,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
