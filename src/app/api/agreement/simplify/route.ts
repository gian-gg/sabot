import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    // Simple text simplification logic
    const simplified = text
      .replace(/\b(shall|will|must|should)\b/gi, 'will')
      .replace(/\b(hereby|thereof|whereas)\b/gi, '')
      .replace(
        /\b(party of the first part|party of the second part)\b/gi,
        'the parties'
      )
      .replace(/\s+/g, ' ')
      .trim();

    return NextResponse.json({ simplified });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to simplify text' },
      { status: 500 }
    );
  }
}
