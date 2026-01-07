import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { IdeaBlock } from '@/types/agreement';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: agreementId } = await params;
    const { ideaBlocks }: { ideaBlocks: IdeaBlock[] } = await request.json();

    if (!ideaBlocks || !Array.isArray(ideaBlocks)) {
      return NextResponse.json(
        { error: 'Invalid idea blocks data' },
        { status: 400 }
      );
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('agreement_participants')
      .select('*')
      .eq('agreement_id', agreementId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Not a participant of this agreement' },
        { status: 403 }
      );
    }

    // Check if already submitted
    if (participant.idea_blocks_submitted) {
      return NextResponse.json(
        { error: 'Idea blocks already submitted' },
        { status: 409 }
      );
    }

    // Update participant to mark idea blocks as submitted
    const { error: updateParticipantError } = await supabase
      .from('agreement_participants')
      .update({
        idea_blocks_submitted: true,
        idea_blocks_submitted_at: new Date().toISOString(),
      })
      .eq('agreement_id', agreementId)
      .eq('user_id', user.id);

    if (updateParticipantError) {
      console.error('Failed to update participant:', updateParticipantError);
      return NextResponse.json(
        { error: 'Failed to update participant' },
        { status: 500 }
      );
    }

    // Store or update idea blocks in agreement content
    const { data: existingContent, error: contentSelectError } = await supabase
      .from('agreement_content')
      .select('*')
      .eq('agreement_id', agreementId)
      .single();

    if (contentSelectError && contentSelectError.code !== 'PGRST116') {
      console.error('Failed to fetch content:', contentSelectError);
      return NextResponse.json(
        { error: 'Failed to fetch agreement content' },
        { status: 500 }
      );
    }

    // Merge with existing idea blocks from other participant
    const existingIdeaBlocks = existingContent?.idea_blocks || [];
    const allIdeaBlocks = [...existingIdeaBlocks, ...ideaBlocks];

    if (existingContent) {
      // Update existing content
      const { error: updateContentError } = await supabase
        .from('agreement_content')
        .update({
          idea_blocks: allIdeaBlocks,
          updated_at: new Date().toISOString(),
        })
        .eq('agreement_id', agreementId);

      if (updateContentError) {
        console.error('Failed to update content:', updateContentError);
        return NextResponse.json(
          { error: 'Failed to update agreement content' },
          { status: 500 }
        );
      }
    } else {
      // Create new content entry
      const { error: insertContentError } = await supabase
        .from('agreement_content')
        .insert({
          agreement_id: agreementId,
          idea_blocks: allIdeaBlocks,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertContentError) {
        console.error('Failed to insert content:', insertContentError);
        return NextResponse.json(
          { error: 'Failed to create agreement content' },
          { status: 500 }
        );
      }
    }

    // Check if both participants have submitted
    const { data: allParticipants, error: allParticipantsError } =
      await supabase
        .from('agreement_participants')
        .select('idea_blocks_submitted')
        .eq('agreement_id', agreementId);

    if (allParticipantsError) {
      console.error('Failed to fetch all participants:', allParticipantsError);
      return NextResponse.json(
        { error: 'Failed to check submission status' },
        { status: 500 }
      );
    }

    const bothSubmitted = allParticipants.every((p) => p.idea_blocks_submitted);

    // Update agreement status if both submitted
    if (bothSubmitted) {
      const { error: updateAgreementError } = await supabase
        .from('agreements')
        .update({
          status: 'in-progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', agreementId);

      if (updateAgreementError) {
        console.error(
          'Failed to update agreement status:',
          updateAgreementError
        );
        // Don't fail the request for this
      }
    }

    // Broadcast update to other participants
    await supabase.channel(`agreement:${agreementId}`).send({
      type: 'broadcast',
      event: 'idea_blocks_submitted',
      payload: {
        userId: user.id,
        bothSubmitted,
      },
    });

    return NextResponse.json({
      success: true,
      bothSubmitted,
      ideaBlocksCount: allIdeaBlocks.length,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
