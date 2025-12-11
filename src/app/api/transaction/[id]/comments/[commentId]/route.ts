import { NextRequest, NextResponse } from 'next/server';
import {
  updateTransactionComment,
  deleteTransactionComment,
} from '@/lib/supabase/db/transaction-comments';
import type { UpdateCommentPayload } from '@/types/transaction';

// PUT /api/transaction/[id]/comments/[commentId] - Update a comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { commentId } = params;

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content } = body;

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

    const payload: UpdateCommentPayload = {
      comment_id: commentId,
      content: content.trim(),
    };

    const result = await updateTransactionComment(payload);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update comment' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.comment,
    });
  } catch (error) {
    console.error('Error updating transaction comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/transaction/[id]/comments/[commentId] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const { commentId } = params;

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteTransactionComment(commentId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete comment' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting transaction comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
