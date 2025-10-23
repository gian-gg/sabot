import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { bucket, path, expiresIn = 3600 } = await req.json();
    if (!bucket || !path) {
      return NextResponse.json(
        { error: 'bucket and path are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data?.signedUrl ?? null });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to create signed URL';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
