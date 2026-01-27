import { updateUserVerificationStatus } from '@/lib/supabase/db/user';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    const diditStatus = payload.status;
    const userId = payload.vendor_data;

    // 1. Validation
    if (!userId) {
      console.error('❌ No vendor_data (userId) found in payload');
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // 2. Map Status based on your requirements
    // Approved -> verified
    // Declined -> rejected
    // Everything else -> pending
    let dbStatus: 'verified' | 'rejected' | 'pending';

    if (diditStatus === 'Approved') {
      dbStatus = 'verified';
    } else if (diditStatus === 'Declined') {
      dbStatus = 'rejected';
    } else {
      // Catches 'Pending', 'In Review', 'Expired', etc.
      dbStatus = 'pending';
    }

    console.log(
      `[Didit Webhook] Mapping "${diditStatus}" to "${dbStatus}" for User: ${userId}`
    );

    // 3. Update Database
    const success = await updateUserVerificationStatus(userId, dbStatus);

    if (!success) {
      console.error(`❌ DB Update Failed for ${userId}. Status: ${dbStatus}`);
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }

    console.log(`✅ User ${userId} successfully updated to "${dbStatus}"`);

    // Always return 200 to Didit to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('💥 Webhook Processing Error:', error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
