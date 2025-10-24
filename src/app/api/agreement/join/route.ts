import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { agreementId, userId } = await request.json();

    // Add user to agreement
    const { data, error } = await supabase
      .from('agreements')
      .update({ participant_id: userId })
      .eq('id', agreementId)
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to join agreement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, agreement: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
