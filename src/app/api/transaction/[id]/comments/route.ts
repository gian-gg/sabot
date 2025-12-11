import { NextRequest, NextResponse } from 'next/server';
import {
  getTransactionComments,
  createTransactionComment,
} from '@/lib/supabase/db/transaction-comments';
import type { CreateCommentPayload } from '@/types/transaction';

// GET /api/transaction/[id]/comments - Get all comments for a transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = params.id;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const comments = await getTransactionComments(transactionId);

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching transaction comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/transaction/[id]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = params.id;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content, parent_comment_id } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Comment content is too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    const payload: CreateCommentPayload = {
      transaction_id: transactionId,
      content: content.trim(),
      parent_comment_id: parent_comment_id || undefined,
    };

    const result = await createTransactionComment(payload);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create comment' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.comment,
    });
  } catch (error) {
    console.error('Error creating transaction comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
