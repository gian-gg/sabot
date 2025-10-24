import { NextRequest, NextResponse } from 'next/server';
import { simplifyLanguage } from '@/lib/ai/contract-analyzer';

/**
 * POST /api/agreement/simplify
 *
 * Simplifies complex legal language while maintaining meaning
 *
 * Request body:
 * {
 *   "text": "The complex legal text to simplify"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "simplified": "Simplified version of the text"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid "text" field',
        },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Text too long. Maximum 5,000 characters allowed.',
        },
        { status: 413 }
      );
    }

    const simplified = await simplifyLanguage(text);

    return NextResponse.json(
      {
        success: true,
        simplified,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Language simplification error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to simplify language. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agreement/simplify
 *
 * Health check / information endpoint
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'Language Simplification API',
      endpoint: 'POST /api/agreement/simplify',
      requestBody: {
        text: 'The legal text to simplify (required, max 5000 chars)',
      },
    },
    { status: 200 }
  );
}
