import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: transactionId } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a participant
    const { data: participant, error: participantError } = await supabase
      .from('transaction_participants')
      .select('*')
      .eq('transaction_id', transactionId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Not a participant of this transaction' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${transactionId}-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('transaction-screenshots')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('transaction-screenshots').getPublicUrl(fileName);

    // Save screenshot record
    const { data: screenshot, error: screenshotError } = await supabase
      .from('transaction_screenshots')
      .insert({
        transaction_id: transactionId,
        user_id: user.id,
        file_path: uploadData.path,
        file_size: file.size,
      })
      .select()
      .single();

    if (screenshotError) {
      console.error('Screenshot record error:', screenshotError);
      // Clean up uploaded file
      await supabase.storage.from('transaction-screenshots').remove([fileName]);
      return NextResponse.json(
        { error: 'Failed to save screenshot record' },
        { status: 500 }
      );
    }

    // Update participant record
    const { error: updateError } = await supabase
      .from('transaction_participants')
      .update({
        screenshot_uploaded: true,
        screenshot_url: publicUrl,
      })
      .eq('id', participant.id);

    if (updateError) {
      console.error('Participant update error:', updateError);
    }

    // Check if both participants have uploaded
    const { data: allParticipants } = await supabase
      .from('transaction_participants')
      .select('screenshot_uploaded')
      .eq('transaction_id', transactionId);

    const bothUploaded =
      allParticipants?.length === 2 &&
      allParticipants.every((p) => p.screenshot_uploaded === true);

    if (bothUploaded) {
      // Update transaction status
      await supabase
        .from('transactions')
        .update({ status: 'screenshots_uploaded' })
        .eq('id', transactionId);
    }

    return NextResponse.json({
      screenshot,
      both_uploaded: bothUploaded,
    });
    // Broadcast update to all clients subscribed to this transaction
    // This works without database replication enabled
    const channel = supabase.channel(`transaction:${transactionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'transaction_update',
      payload: {
        type: 'screenshot_uploaded',
        transaction_id: transactionId,
        user_id: user.id,
        both_uploaded: bothUploaded,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
