import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { escrowId, confirmation } = await request.json();

    // Update escrow confirmation
    const { data, error } = await supabase
      .from('escrows')
      .update({
        initiator_confirmation:
          confirmation === 'initiator' ? 'confirmed' : 'pending',
        participant_confirmation:
          confirmation === 'participant' ? 'confirmed' : 'pending',
      })
      .eq('id', escrowId)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to confirm escrow: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, escrow: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}
