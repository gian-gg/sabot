import { updateUserVerificationStatus } from '@/lib/supabase/db/user';
import { sendApprovedEmail, sendRejectedEmail } from '@/lib/email/verify';
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

    // 4. Send Email Notifications
    // Email failures should not break the webhook response
    try {
      if (dbStatus === 'verified') {
        await sendApprovedEmail(userId);
        console.log(`📧 Approved email sent to user ${userId}`);
      } else if (dbStatus === 'rejected') {
        await sendRejectedEmail(userId);
        console.log(`📧 Rejected email sent to user ${userId}`);
      }
    } catch (emailError) {
      console.error(`⚠️  Email sending failed for user ${userId}:`, emailError);
      // Don't throw - we still want to return 200 to Didit
    }

    // Always return 200 to Didit to acknowledge receipt
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
