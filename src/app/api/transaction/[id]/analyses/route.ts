import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: transactionId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get analyses with screenshot information
    const { data: analyses, error } = await supabase
      .from('transaction_analyses')
      .select(
        `
        *,
        transaction_screenshots!inner (
          file_path,
          user_id
        )
      `
      )
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analyses' },
        { status: 500 }
      );
    }

    const analysesWithUrls = await Promise.all(
      analyses?.map(async (analysis) => {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from('transaction-screenshots')
            .createSignedUrl(analysis.transaction_screenshots.file_path, 3600); // 1 hour expiry

        if (signedUrlError) {
          console.error(
            'Failed to create signed URL for:',
            analysis.transaction_screenshots.file_path,
            signedUrlError
          );
        }

        return {
          id: analysis.id,
          user_id: analysis.transaction_screenshots.user_id,
          screenshot_url: signedUrlData?.signedUrl || '',
          ...analysis.analysis_data,
        };
      }) || []
    );

    return NextResponse.json({ analyses: analysesWithUrls || [] });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
