'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CommentIndicatorProps {
  count: number;
  className?: string;
}

const CommentIndicator: React.FC<CommentIndicatorProps> = ({
  count,
  className = '',
}) => {
  if (count === 0) return null;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <MessageSquare className="h-4 w-4 text-gray-500" />
      <Badge variant="secondary" className="text-xs">
        {count}
      </Badge>
    </div>
  );
};

export default CommentIndicator;
