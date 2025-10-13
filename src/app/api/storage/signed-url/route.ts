import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { fileName, fileType, bucket } = await request.json();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate signed URL for file upload
    const { data, error } = await supabase.storage
      .from(bucket || 'documents')
      .createSignedUploadUrl(fileName);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create signed URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({ signedUrl: data.signedUrl, path: data.path });
  } catch (error) {
    console.error('Error creating signed URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
