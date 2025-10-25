import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    console.log('[confirm] User confirming agreement:', {
      agreementId,
      userId: user.id,
    });

    // Verify user is a participant in this agreement
    const { data: participant, error: participantError } = await supabase
      .from('agreement_participants')
      .select('id, has_confirmed')
      .eq('agreement_id', agreementId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      console.error('[confirm] User is not a participant:', participantError);
      return NextResponse.json(
        { error: 'User is not a participant of this agreement' },
        { status: 403 }
      );
    }

    // Update current user's confirmation status
    const { error: updateError } = await supabase
      .from('agreement_participants')
      .update({ has_confirmed: true })
      .eq('id', participant.id);

    if (updateError) {
      console.error('[confirm] Failed to update confirmation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update confirmation status' },
        { status: 500 }
      );
    }

    console.log('[confirm] Updated participant confirmation');

    // Fetch all participants to check if all have confirmed
    const { data: allParticipants, error: fetchError } = await supabase
      .from('agreement_participants')
      .select('id, user_id, role, has_confirmed')
      .eq('agreement_id', agreementId);

    if (fetchError || !allParticipants) {
      console.error('[confirm] Failed to fetch participants:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    // Check if ALL participants have confirmed
    const allConfirmed = allParticipants.every((p) => p.has_confirmed);
    console.log('[confirm] Confirmation status:', {
      totalParticipants: allParticipants.length,
      confirmedCount: allParticipants.filter((p) => p.has_confirmed).length,
      allConfirmed,
    });

    // If all confirmed, update agreement status to 'finalized'
    if (allConfirmed) {
      const { error: statusError } = await supabase
        .from('agreements')
        .update({
          status: 'finalized',
          updated_at: new Date().toISOString(),
        })
        .eq('id', agreementId);

      if (statusError) {
        console.error(
          '[confirm] Failed to update agreement status:',
          statusError
        );
        return NextResponse.json(
          { error: 'Failed to finalize agreement' },
          { status: 500 }
        );
      }

      console.log('[confirm] Agreement finalized - all participants confirmed');
    }

    // Return updated state
    return NextResponse.json({
      success: true,
      allConfirmed,
      participants: allParticipants,
      message: allConfirmed
        ? 'Agreement finalized! All parties have confirmed.'
        : 'Your confirmation has been recorded. Waiting for other parties...',
    });
  } catch (error) {
    console.error('[confirm] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
