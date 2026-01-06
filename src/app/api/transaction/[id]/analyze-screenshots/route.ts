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

    // Check if analysis already exists
    console.log('🔍 Checking if analysis already exists...');
    const { data: existingAnalyses, error: analysisCheckError } = await supabase
      .from('transaction_analyses')
      .select('id')
      .eq('transaction_id', transactionId);

    if (analysisCheckError) {
      console.error('❌ Error checking existing analyses:', analysisCheckError);
    }

    // If analyses already exist, return them instead of reprocessing
    if (existingAnalyses && existingAnalyses.length > 0) {
      console.log('✅ Analysis already exists, returning existing results');

      // Get the full analysis data
      const { data: analyses, error: fetchError } = await supabase
        .from('transaction_analyses')
        .select('*')
        .eq('transaction_id', transactionId);

      if (fetchError) {
        console.error('❌ Error fetching existing analyses:', fetchError);
      } else {
        // Keep existing status - don't automatically change to active
        const { data: currentTransaction } = await supabase
          .from('transactions')
          .select('status')
          .eq('id', transactionId)
          .single();

        return NextResponse.json({
          results: analyses || [],
          status: currentTransaction?.status || 'screenshots_uploaded',
          cached: true,
        });
      }
    }

    console.log('🚀 No existing analysis found, proceeding with analysis...');

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

    for (let i = 0; i < screenshots.length; i++) {
      const screenshot = screenshots[i];
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

        console.log(
          `🔍 Processing screenshot ${screenshot.id} (${i + 1}/${screenshots.length})`
        );

        // Extract conversation data
        console.log(
          `🔍 Calling extractConversation for screenshot ${screenshot.id}...`
        );
        const conversationData = await extractConversation(file);
        console.log(
          `📊 Extracted data for screenshot ${screenshot.id}:`,
          JSON.stringify(conversationData, null, 2)
        );

        // Validate analysis data has required fields
        if (!conversationData) {
          console.error(
            `❌ No conversation data returned for screenshot ${screenshot.id}`
          );
          continue;
        }

        if (typeof conversationData.confidence !== 'number') {
          console.error(
            `❌ Invalid confidence value for screenshot ${screenshot.id}:`,
            conversationData.confidence
          );
          // Set a default confidence if missing
          conversationData.confidence = 0;
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
        console.error(
          `❌ Failed to analyze screenshot ${screenshot.id}:`,
          error
        );
        console.error('Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }

    // Keep status as 'screenshots_uploaded' - don't automatically change to 'active'
    // Analysis is complete, but status should only change to 'active' when users finalize
    console.log('✅ Analysis complete, keeping status as screenshots_uploaded');

    // Get current transaction status
    const { data: currentTransaction } = await supabase
      .from('transactions')
      .select('status')
      .eq('id', transactionId)
      .single();

    const currentStatus = currentTransaction?.status || 'screenshots_uploaded';

    // Broadcast analysis completion to all participants
    console.log('📡 Broadcasting analysis completion event...');
    const channel = supabase.channel(`transaction:${transactionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'transaction_update',
      payload: {
        status: currentStatus,
        message: 'Screenshot analysis complete',
      },
    });
    console.log('✅ Broadcast sent for analysis completion');

    console.log(
      `✅ Analysis complete. Returning ${analysisResults.length} results`
    );
    console.log('Results:', JSON.stringify(analysisResults, null, 2));

    // Get final transaction status
    const { data: finalTransaction } = await supabase
      .from('transactions')
      .select('status')
      .eq('id', transactionId)
      .single();

    return NextResponse.json({
      results: analysisResults,
      status: finalTransaction?.status || 'screenshots_uploaded',
    });
  } catch (error) {
    console.error('❌ Analysis error:', error);
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
