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

  // 2. Fetch transaction and verify ownership + status
  const { data: transaction, error: fetchError } = await supabase
    .from('transactions')
    .select('id, creator_id, status')
    .eq('id', id)
    .single();

  if (fetchError || !transaction) {
    console.error('Error fetching transaction:', fetchError);
    return NextResponse.json(
      { error: 'Transaction not found' },
      { status: 404 }
    );
  }

  // 3. Validate ownership
  if (transaction.creator_id !== user.id) {
    return NextResponse.json(
      { error: 'Only the creator can cancel this transaction' },
      { status: 403 }
    );
  }

  // 4. Validate transaction status is 'active' only
  if (transaction.status !== 'active') {
    return NextResponse.json(
      { error: 'Only active transactions can be cancelled' },
      { status: 400 }
    );
  }

  // 5. Update status to 'cancelled'
  const { error: updateError } = await supabase
    .from('transactions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Failed to cancel transaction:', updateError);
    return NextResponse.json(
      { error: 'Failed to cancel transaction' },
      { status: 500 }
    );
  }

  // 6. Broadcast cancellation to all participants
  const channel = supabase.channel(`transaction:${id}`);
  await channel.send({
    type: 'broadcast',
    event: 'transaction_cancelled',
    payload: {
      transaction_id: id,
      cancelled_by: user.id,
      cancelled_at: new Date().toISOString(),
    },
  });

  console.log(
    `[Cancel] Transaction ${id.slice(0, 8)} cancelled by ${user.id.slice(0, 8)}`
  );

  return NextResponse.json({ success: true, transaction_id: id });
}
