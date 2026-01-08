import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let user: { id: string } | null = null;
  const { id: agreementId } = await params;
  const supabase = await createClient();

  try {
    const { prompt } = await request.json();

    if (!prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Get current user
    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    user = authUser;

    // Check if agreement exists and user is participant
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

    // Store the prompt
    const { error: insertError } = await supabase
      .from('agreement_prompts')
      .upsert(
        {
          agreement_id: agreementId,
          user_id: user.id,
          prompt: prompt.trim(),
          created_at: new Date().toISOString(),
        },
        {
          onConflict: 'agreement_id,user_id',
        }
      );

    if (insertError) {
      console.error('Error storing prompt:', insertError);
      return NextResponse.json(
        { error: 'Failed to store prompt' },
        { status: 500 }
      );
    }

    // Check if both parties have submitted prompts
    const { data: prompts, error: promptsError } = await supabase
      .from('agreement_prompts')
      .select('user_id, prompt')
      .eq('agreement_id', agreementId);

    if (promptsError) {
      console.error('Error checking prompts:', promptsError);
      return NextResponse.json(
        { error: 'Failed to check submission status' },
        { status: 500 }
      );
    }

    const bothPromptsSubmitted =
      prompts.length >= 2 &&
      prompts.some((p) => p.user_id === agreement.creator_id) &&
      prompts.some((p) => p.user_id === agreement.participant_id);

    return NextResponse.json({
      success: true,
      bothPromptsSubmitted,
    });
  } catch (error) {
    console.error('Error in submit-prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Broadcast event for real-time updates
    if (user) {
      await supabase.channel(`agreement:${agreementId}`).send({
        type: 'broadcast',
        event: 'prompt_submitted',
        payload: { agreementId, userId: user.id },
      });
    }
  }
}
