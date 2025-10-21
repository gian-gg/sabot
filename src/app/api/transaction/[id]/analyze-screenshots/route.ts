import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractConversation } from '@/lib/gemini/conversation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: transactionId } = await params;

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all screenshots for this transaction
    const { data: screenshots, error } = await supabase
      .from('transaction_screenshots')
      .select('*')
      .eq('transaction_id', transactionId);

    if (error || !screenshots?.length) {
      return NextResponse.json(
        { error: 'No screenshots found' },
        { status: 404 }
      );
    }

    // Process each screenshot
    const analysisResults = [];

    for (const screenshot of screenshots) {
      try {
        // Download file from Supabase storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('transaction-screenshots')
          .download(screenshot.file_path);

        if (downloadError) continue;

        // Convert blob to File
        const file = new File([fileData], screenshot.file_path, {
          type: 'image/jpeg', // Adjust based on actual file type
        });

        // Extract conversation data
        const conversationData = await extractConversation(file);

        // Validate analysis data has required fields
        if (
          !conversationData ||
          typeof conversationData.confidence !== 'number'
        ) {
          console.error(
            `Invalid analysis data for screenshot ${screenshot.id}`
          );
          continue;
        }

        // Save analysis result
        const { error: analysisError } = await supabase
          .from('transaction_analyses')
          .insert({
            transaction_id: transactionId,
            screenshot_id: screenshot.id,
            user_id: screenshot.user_id,
            analysis_data: conversationData,
            created_at: new Date(),
          });

        if (!analysisError) {
          analysisResults.push({
            user_id: screenshot.user_id,
            data: conversationData,
          });
        }
      } catch (error) {
        console.error(`Failed to analyze screenshot ${screenshot.id}:`, error);
      }
    }

    // Update transaction status
    await supabase
      .from('transactions')
      .update({ status: 'analysis_complete' })
      .eq('id', transactionId);

    return NextResponse.json({ results: analysisResults });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
