import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface IdeaBlock {
  id?: string;
  title: string;
  content: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agreementId } = await params;

    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get agreement and verify access
    const { data: agreement, error: agreementError } = await supabase
      .from('agreements')
      .select('creator_id, participant_id, status')
      .eq('id', agreementId)
      .single();

    if (agreementError || !agreement) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      );
    }

    const isCreator = user.id === agreement.creator_id;
    const isParticipant = user.id === agreement.participant_id;

    if (!isCreator && !isParticipant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get both prompts
    const { data: prompts, error: promptsError } = await supabase
      .from('agreement_prompts')
      .select('user_id, prompt')
      .eq('agreement_id', agreementId);

    if (promptsError || !prompts || prompts.length < 2) {
      return NextResponse.json(
        { error: 'Both prompts must be submitted before generation' },
        { status: 400 }
      );
    }

    // Ensure we have prompts from both parties
    const creatorPrompt = prompts.find(
      (p) => p.user_id === agreement.creator_id
    )?.prompt;
    const participantPrompt = prompts.find(
      (p) => p.user_id === agreement.participant_id
    )?.prompt;

    if (!creatorPrompt || !participantPrompt) {
      return NextResponse.json(
        { error: 'Missing prompts from one or both parties' },
        { status: 400 }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Combine prompts and generate content
    const combinedPrompt = `
You are an expert legal document generator. Based on the following two descriptions from both parties of a collaboration, generate 5 structured idea blocks for their agreement.

Party A Input: "${creatorPrompt}"

Party B Input: "${participantPrompt}"

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

    try {
      const result = await model.generateContent(combinedPrompt);
      const response = await result.response;
      const generatedText = response.text();

      // Parse the JSON response from Gemini
      let parsedResponse;
      try {
        // Remove any markdown formatting if present
        const cleanedText = generatedText
          .replace(/```json\n?|```\n?/g, '')
          .trim();
        parsedResponse = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);

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

      return NextResponse.json({
        success: true,
        ideaBlocks: parsedResponse.ideaBlocks || [],
        combinedPrompt: `${creatorPrompt} | ${participantPrompt}`,
      });
    } catch (genError) {
      console.error('Gemini generation error:', genError);

      // Fallback to basic template-based generation
      const fallbackBlocks = [
        {
          id: `${Date.now()}-1`,
          title: 'Purpose & Scope',
          content: `This agreement establishes the framework for the collaboration described in the following needs: "${creatorPrompt}" and "${participantPrompt}". The parties agree to work together to achieve their mutual objectives.`,
        },
        {
          id: `${Date.now()}-2`,
          title: 'Roles & Responsibilities',
          content:
            'Each party shall contribute their expertise and resources as outlined in their initial requirements. Clear communication and regular updates will be maintained throughout the collaboration.',
        },
        {
          id: `${Date.now()}-3`,
          title: 'Timeline & Deliverables',
          content:
            'The project timeline and specific deliverables will be determined based on the scope outlined by both parties. Milestones will be established to track progress.',
        },
        {
          id: `${Date.now()}-4`,
          title: 'Compensation & Terms',
          content:
            'Payment terms and compensation structure will be agreed upon based on the nature of the collaboration and the value provided by each party.',
        },
        {
          id: `${Date.now()}-5`,
          title: 'Legal Framework',
          content:
            'This agreement includes confidentiality provisions, termination clauses, and dispute resolution mechanisms to protect both parties throughout the collaboration.',
        },
      ];

      return NextResponse.json({
        success: true,
        ideaBlocks: fallbackBlocks,
        fallback: true,
      });
    }
  } catch (error) {
    console.error('Error in generate-with-gemini:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
