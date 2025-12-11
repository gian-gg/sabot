'use server';

import { createClient } from '../server';
import type {
  TransactionComment,
  CreateCommentPayload,
  UpdateCommentPayload,
} from '@/types/transaction';
import type { TransactionParticipant } from '@/types/transaction';

/**
 * Get comments for a transaction with user details
 */
export async function getTransactionComments(
  transactionId: string
): Promise<TransactionComment[]> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('transaction_comments')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: true });

    if (error) {
      // Table might not exist yet
      if (
        error.code === 'PGRST116' ||
        error.message.includes('does not exist')
      ) {
        console.warn('Comments table does not exist yet - migration needed');
        return [];
      }
      console.error('Error fetching transaction comments:', error.message);
      return [];
    }

    // Comments already have user_name, user_email, user_avatar_url stored with them
    const comments = (data || []).map((comment: TransactionComment) => ({
      id: comment.id,
      transaction_id: comment.transaction_id,
      user_id: comment.user_id,
      content: comment.content,
      parent_comment_id: comment.parent_comment_id,
      edited_at: comment.edited_at,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user_name: comment.user_name || `User ${comment.user_id.substring(0, 8)}`,
      user_email: comment.user_email,
      user_avatar_url: comment.user_avatar_url,
    }));

    // Build comment tree (organize replies)
    const commentMap = new Map<string, TransactionComment>();
    const rootComments: TransactionComment[] = [];

    // First pass: create map of all comments
    comments.forEach((comment) => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    // Second pass: organize into tree structure
    comments.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies!.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  } catch (error) {
    console.error('Unexpected error loading comments:', error);
    return [];
  }
}

/**
 * Create a new comment on a transaction
 */
export async function createTransactionComment(
  payload: CreateCommentPayload
): Promise<{ success: boolean; comment?: TransactionComment; error?: string }> {
  const supabase = await createClient();

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Verify user can comment on this transaction
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .select(
        `
        id,
        creator_id,
        transaction_participants!inner(user_id)
      `
      )
      .eq('id', payload.transaction_id)
      .single();

    if (transactionError || !transactionData) {
      return { success: false, error: 'Transaction not found' };
    }

    const isParticipant =
      transactionData.creator_id === user.id ||
      transactionData.transaction_participants.some(
        (p: TransactionParticipant) => p.user_id === user.id
      );

    if (!isParticipant) {
      return {
        success: false,
        error: 'Not authorized to comment on this transaction',
      };
    }

    // If replying to a comment, verify parent exists
    if (payload.parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('transaction_comments')
        .select('id')
        .eq('id', payload.parent_comment_id)
        .eq('transaction_id', payload.transaction_id)
        .single();

      if (parentError || !parentComment) {
        return { success: false, error: 'Parent comment not found' };
      }
    }

    // Get user info from auth.users metadata FIRST
    const { data: userData } = await supabase.auth.getUser();
    const userMetadata = userData?.user?.user_metadata;

    // Create the comment
    const { data: commentData, error: createError } = await supabase
      .from('transaction_comments')
      .insert({
        transaction_id: payload.transaction_id,
        user_id: user.id,
        content: payload.content.trim(),
        parent_comment_id: payload.parent_comment_id || null,
        user_name:
          userMetadata?.name ||
          userMetadata?.full_name ||
          user.email?.split('@')[0] ||
          'User',
        user_email: user.email,
        user_avatar_url:
          userMetadata?.avatar_url || userMetadata?.picture || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create comment error:', createError);
      // Check if table doesn't exist
      if (
        createError.code === 'PGRST116' ||
        createError.message.includes('does not exist')
      ) {
        return {
          success: false,
          error: 'Comments feature not available - database migration needed',
        };
      }
      return {
        success: false,
        error: createError.message || 'Failed to create comment',
      };
    }

    if (!commentData) {
      return { success: false, error: 'No comment data returned' };
    }

    const comment: TransactionComment = {
      id: commentData.id,
      transaction_id: commentData.transaction_id,
      user_id: commentData.user_id,
      content: commentData.content,
      parent_comment_id: commentData.parent_comment_id,
      edited_at: commentData.edited_at,
      created_at: commentData.created_at,
      updated_at: commentData.updated_at,
      user_name: commentData.user_name,
      user_email: commentData.user_email,
      user_avatar_url: commentData.user_avatar_url,
      replies: [],
    };

    return { success: true, comment };
  } catch (error) {
    console.error('Unexpected error creating comment:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing comment
 */
export async function updateTransactionComment(
  payload: UpdateCommentPayload
): Promise<{ success: boolean; comment?: TransactionComment; error?: string }> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'User not authenticated' };
  }

  // Update the comment (RLS will ensure user owns it)
  const { data: commentData, error: updateError } = await supabase
    .from('transaction_comments')
    .update({
      content: payload.content.trim(),
      edited_at: new Date().toISOString(),
    })
    .eq('id', payload.comment_id)
    .eq('user_id', user.id) // Ensure user owns the comment
    .select()
    .single();

  if (updateError || !commentData) {
    console.error('Update comment error:', updateError);
    return {
      success: false,
      error:
        updateError?.message || 'Failed to update comment or comment not found',
    };
  }

  const comment: TransactionComment = {
    id: commentData.id,
    transaction_id: commentData.transaction_id,
    user_id: commentData.user_id,
    content: commentData.content,
    parent_comment_id: commentData.parent_comment_id,
    edited_at: commentData.edited_at,
    created_at: commentData.created_at,
    updated_at: commentData.updated_at,
    user_name: commentData.user_name,
    user_email: commentData.user_email,
    user_avatar_url: commentData.user_avatar_url,
    replies: [],
  };

  return { success: true, comment };
}

/**
 * Delete a comment
 */
export async function deleteTransactionComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'User not authenticated' };
  }

  // Delete the comment (RLS will ensure user owns it)
  const { error: deleteError } = await supabase
    .from('transaction_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (deleteError) {
    return {
      success: false,
      error: 'Failed to delete comment or comment not found',
    };
  }

  return { success: true };
}

/**
 * Get comment count for a transaction
 */
export async function getTransactionCommentCount(
  transactionId: string
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('transaction_comments')
    .select('id', { count: 'exact' })
    .eq('transaction_id', transactionId);

  if (error) {
    console.error('Error fetching comment count:', error.message);
    return 0;
  }

  return count || 0;
}
