'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Reply,
  Edit2,
  Trash2,
  Send,
  ChevronDown,
  ChevronRight,
  User,
} from 'lucide-react';
import type { TransactionComment } from '@/types/transaction';
import {
  getTransactionComments,
  createTransactionComment,
  updateTransactionComment,
  deleteTransactionComment,
} from '@/lib/supabase/db/transaction-comments';

interface CommentThreadProps {
  transactionId: string;
  currentUserId?: string;
}

interface CommentItemProps {
  comment: TransactionComment;
  currentUserId?: string;
  onReply: (parentId: string) => void;
  onEdit: (comment: TransactionComment) => void;
  onDelete: (commentId: string) => void;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  level = 0,
}) => {
  const isOwner = currentUserId === comment.user_id;
  const maxLevel = 3; // Limit nesting depth

  return (
    <div className={`${level > 0 ? 'mt-2 ml-4' : ''}`}>
      <div className="bg-background border-border hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 flex space-x-2 rounded-lg border px-5 py-5 transition-colors">
        {/* User Avatar - matching participant pattern */}
        {comment.user_avatar_url ? (
          <Image
            src={comment.user_avatar_url}
            alt={comment.user_name || 'User'}
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="from-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br to-blue-500/20">
            <User className="h-4 w-4" />
          </div>
        )}

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-foreground font-medium">
                {comment.user_name || comment.user_email}
              </span>
              <span className="text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                })}
              </span>
              {comment.edited_at && (
                <span className="text-muted-foreground text-xs">(edited)</span>
              )}
            </div>

            {/* Action Buttons - Moved to right side */}
            <div className="flex shrink-0 items-center space-x-1">
              {level < maxLevel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(comment.id)}
                  className="text-muted-foreground hover:text-foreground flex h-5 w-5 items-center justify-center p-0"
                  title="Reply"
                >
                  <Reply className="h-3 w-3" />
                </Button>
              )}

              {isOwner && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(comment)}
                    className="text-muted-foreground hover:text-foreground flex h-5 w-5 items-center justify-center p-0"
                    title="Edit"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(comment.id)}
                    className="flex h-5 w-5 items-center justify-center p-0 text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="text-foreground whitespace-pre-wrap">
            {comment.content}
          </div>
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 ml-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentThread: React.FC<CommentThreadProps> = ({
  transactionId,
  currentUserId,
}) => {
  const [comments, setComments] = useState<TransactionComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingComment, setEditingComment] =
    useState<TransactionComment | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      const fetchedComments = await getTransactionComments(transactionId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
      // For now, just set empty array to prevent infinite loading
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await createTransactionComment({
        transaction_id: transactionId,
        content: newComment.trim(),
        parent_comment_id: replyToId || undefined,
      });

      if (result.success) {
        await loadComments(); // Refresh comments
        setNewComment('');
        setReplyToId(null);
      } else {
        console.error('Failed to create comment:', result.error);
        // Show a user-friendly error
        alert(`Error: ${result.error || 'Failed to create comment'}`);
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('An unexpected error occurred while creating the comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async () => {
    if (!editingComment || !editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await updateTransactionComment({
        comment_id: editingComment.id,
        content: editContent.trim(),
      });

      if (result.success) {
        await loadComments();
        setEditingComment(null);
        setEditContent('');
      } else {
        console.error('Failed to update comment:', result.error);
      }
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const result = await deleteTransactionComment(commentId);
      if (result.success) {
        await loadComments();
      } else {
        console.error('Failed to delete comment:', result.error);
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleReply = (parentId: string) => {
    setReplyToId(parentId);
    setEditingComment(null);
  };

  const handleEdit = (comment: TransactionComment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setReplyToId(null);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const cancelReply = () => {
    setReplyToId(null);
    setNewComment('');
  };

  if (!currentUserId) {
    return null; // Don't show comments if user is not authenticated
  }

  return (
    <Card className="bg-background dark:bg-input/30 dark:border-input mt-6 border shadow-xs">
      <CardContent className="px-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-input/50 flex h-auto w-full items-center justify-between p-0"
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="text-foreground h-5 w-5" />
                <h3 className="text-foreground font-semibold">
                  Comments ({comments.length})
                </h3>
              </div>
              {isOpen ? (
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              ) : (
                <ChevronRight className="text-muted-foreground h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-3 space-y-3">
            {/* Comment Form */}
            <div>
              {replyToId && (
                <div className="text-muted-foreground mb-2 text-sm">
                  Replying to comment
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelReply}
                    className="ml-2 h-auto p-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={
                    replyToId ? 'Write a reply...' : 'Add a comment...'
                  }
                  className="resize-none"
                  maxLength={2000}
                />

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {newComment.length}/2000 characters
                  </span>

                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {replyToId ? 'Reply' : 'Comment'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {isLoading ? (
              <div className="text-muted-foreground py-4 text-center">
                Loading comments...
              </div>
            ) : comments.length === 0 ? null : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </div>
            )}
          </CollapsibleContent>

          {/* Edit Modal */}
          {editingComment && (
            <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
              <Card className="bg-background dark:bg-input/30 dark:border-input w-full max-w-md">
                <CardContent>
                  <h4 className="mb-3 font-semibold">Edit Comment</h4>

                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="mb-3 resize-none"
                    maxLength={2000}
                  />

                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      {editContent.length}/2000 characters
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleEditComment}
                      disabled={!editContent.trim() || isSubmitting}
                      size="sm"
                    >
                      Save Changes
                    </Button>

                    <Button variant="outline" onClick={cancelEdit} size="sm">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default CommentThread;
