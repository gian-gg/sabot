import { updateUserVerificationStatus } from '@/lib/supabase/db/user';
import { sendApprovedEmail, sendRejectedEmail } from '@/lib/email/verify';
import { NextResponse } from 'next/server';
import { type VerificationStatus } from '@/types/user';

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

    // 2. Map Status
    let dbStatus: VerificationStatus;

    if (diditStatus === 'Approved') {
      dbStatus = 'verified';
    } else if (diditStatus === 'Declined') {
      dbStatus = 'rejected';
    } else if (diditStatus === 'Not Started') {
      dbStatus = 'not-started';
    } else {
      dbStatus = 'pending';
    }

    // 3. Update Database
    const success = await updateUserVerificationStatus(userId, dbStatus);

    if (!success) {
      console.error(`❌ DB Update Failed for ${userId}. Status: ${dbStatus}`);
      return NextResponse.json(
        { error: 'Database update failed' },
        { status: 500 }
      );
    }

    // 4. Send Email Notifications
    try {
      if (dbStatus === 'verified') {
        await sendApprovedEmail(userId);
      } else if (dbStatus === 'rejected') {
        await sendRejectedEmail(userId);
      }
    } catch (emailError) {
      console.error(`⚠️  Email sending failed for user ${userId}:`, emailError);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 Webhook Processing Error:', errorMessage);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
