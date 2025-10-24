import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a participant in this transaction
    const { data: participant, error: participantError } = await supabase
      .from('transaction_participants')
      .select('*')
      .eq('transaction_id', id)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Not a participant of this transaction' },
        { status: 403 }
      );
    }

    // Update participant confirmation
    const { error: updateError } = await supabase
      .from('transaction_participants')
      .update({
        has_confirmed: true,
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', participant.id);

    if (updateError) {
      console.error('Error confirming participant:', updateError);
      return NextResponse.json(
        { error: 'Failed to confirm participation' },
        { status: 500 }
      );
    }

    // Check if both participants have confirmed
    const { data: allParticipants, error: participantsError } = await supabase
      .from('transaction_participants')
      .select('has_confirmed')
      .eq('transaction_id', id);

    if (participantsError) {
      console.error('Error checking participants:', participantsError);
      return NextResponse.json(
        { error: 'Failed to check participant status' },
        { status: 500 }
      );
    }

    const bothConfirmed =
      allParticipants?.every((p) => p.has_confirmed) || false;

    // If both confirmed, update transaction status to completed
    if (bothConfirmed) {
      const { error: transactionUpdateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (transactionUpdateError) {
        console.error(
          'Error updating transaction status:',
          transactionUpdateError
        );
      }
    }

    // Broadcast update to all clients subscribed to this transaction
    const channel = supabase.channel(`transaction:${id}`);
    await channel.send({
      type: 'broadcast',
      event: 'transaction_update',
      payload: {
        type: 'participant_confirmed',
        transaction_id: id,
        user_id: user.id,
        both_confirmed: bothConfirmed,
      },
    });

    return NextResponse.json({
      success: true,
      both_confirmed: bothConfirmed,
      message: bothConfirmed
        ? 'Both participants confirmed! Transaction is now completed.'
        : 'Confirmation recorded. Waiting for other participant.',
    });
  } catch (error) {
    console.error('Error confirming transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
