import { NextRequest, NextResponse } from 'next/server';
import { analyzeContractDocument } from '@/lib/ai/contract-analyzer';
import type { ContractAnalysisResult } from '@/lib/ai/contract-analyzer';

/**
 * Rate limiting implementation
 * Simple in-memory rate limiter (in production, use Redis or similar)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_REQUESTS = 10; // Max requests per window
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Create new record
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count < RATE_LIMIT_REQUESTS) {
    record.count++;
    return true;
  }

  return false;
}

/**
 * POST /api/agreement/analyze
 *
 * Analyzes a legal agreement document using Gemini AI
 *
 * Request body:
 * {
 *   "content": "HTML content of the agreement",
 *   "type": "grammar|clauses|risks|all" (optional, defaults to "all")
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "grammar": [...],
 *     "clauses": [...],
 *     "risks": [...],
 *     "improvements": [...],
 *     "summary": "..."
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please wait before trying again.',
        },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content, type = 'all' } = body;

    // Validate input
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid "content" field. Must be a string.',
        },
        { status: 400 }
      );
    }

    // Check content length (prevent abuse)
    if (content.length > 50000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Content too long. Maximum 50,000 characters allowed.',
        },
        { status: 413 }
      );
    }

    // Validate analysis type
    const validTypes = ['grammar', 'clauses', 'risks', 'all'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Call the contract analyzer
    const analysis = await analyzeContractDocument(content);

    // Filter results based on type parameter
    let result: ContractAnalysisResult = analysis;
    if (type !== 'all') {
      result = {
        grammar: type === 'grammar' ? analysis.grammar : [],
        clauses: type === 'clauses' ? analysis.clauses : [],
        risks: type === 'risks' ? analysis.risks : [],
        improvements: [],
        summary: analysis.summary,
      };
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Agreement analysis error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    // Check for specific error types
    if (errorMessage.includes('GEMINI_API_KEY')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service not properly configured. Please contact support.',
        },
        { status: 500 }
      );
    }

    if (errorMessage.includes('API') || errorMessage.includes('rate limit')) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service temporarily unavailable. Please try again later.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze agreement. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agreement/analyze
 *
 * Health check / information endpoint
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'Agreement Analysis API',
      endpoint: 'POST /api/agreement/analyze',
      requestBody: {
        content: 'HTML content of agreement (required)',
        type: "grammar|clauses|risks|all (optional, defaults to 'all')",
      },
    },
    { status: 200 }
  );
}
