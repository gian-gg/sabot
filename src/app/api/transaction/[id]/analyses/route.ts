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

    // Add public URLs to the response
    const analysesWithUrls = analyses?.map((analysis) => ({
      ...analysis,
      screenshot_url: supabase.storage
        .from('transaction-screenshots')
        .getPublicUrl(analysis.transaction_screenshots.file_path).data
        .publicUrl,
    }));

    return NextResponse.json({ analyses: analysesWithUrls || [] });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
