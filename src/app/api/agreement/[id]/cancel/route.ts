import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Fetch agreement and verify ownership + status
  const { data: agreement, error: fetchError } = await supabase
    .from('agreements')
    .select('id, creator_id, status')
    .eq('id', id)
    .single();

  if (fetchError || !agreement) {
    console.error('Error fetching agreement:', fetchError);
    return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
  }

  // 3. Validate ownership
  if (agreement.creator_id !== user.id) {
    return NextResponse.json(
      { error: 'Only the creator can cancel this agreement' },
      { status: 403 }
    );
  }

  // 4. Validate agreement status - cannot cancel finalized agreements
  if (agreement.status === 'finalized') {
    return NextResponse.json(
      { error: 'Finalized agreements cannot be cancelled' },
      { status: 400 }
    );
  }

  if (agreement.status === 'cancelled') {
    return NextResponse.json(
      { error: 'Agreement is already cancelled' },
      { status: 400 }
    );
  }

  // 5. Update status to 'cancelled'
  const { error: updateError } = await supabase
    .from('agreements')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Failed to cancel agreement:', updateError);
    return NextResponse.json(
      { error: 'Failed to cancel agreement' },
      { status: 500 }
    );
  }

  // 6. Broadcast cancellation to all participants
  const channel = supabase.channel(`agreement:${id}`);
  await channel.send({
    type: 'broadcast',
    event: 'agreement_cancelled',
    payload: {
      agreement_id: id,
      cancelled_by: user.id,
      cancelled_at: new Date().toISOString(),
    },
  });

  console.log(
    `[Cancel] Agreement ${id.slice(0, 8)} cancelled by ${user.id.slice(0, 8)}`
  );

  return NextResponse.json({ success: true, agreement_id: id });
}
