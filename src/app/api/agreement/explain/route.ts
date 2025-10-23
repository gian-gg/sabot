import { NextRequest, NextResponse } from 'next/server';
import { explainClause } from '@/lib/ai/contract-analyzer';

/**
 * POST /api/agreement/explain
 *
 * Explains a legal clause in simple, non-legal terms
 *
 * Request body:
 * {
 *   "text": "The clause text to explain"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "explanation": "Simple explanation of what this clause means"
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

    const explanation = await explainClause(text);

    return NextResponse.json(
      {
        success: true,
        explanation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Clause explanation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to explain clause. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agreement/explain
 *
 * Health check / information endpoint
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'Clause Explanation API',
      endpoint: 'POST /api/agreement/explain',
      requestBody: {
        text: 'The clause text to explain (required, max 5000 chars)',
      },
    },
    { status: 200 }
  );
}
