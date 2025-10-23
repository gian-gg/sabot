import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not-started':
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="border-yellow-500/50 text-yellow-500"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'complete':
        return (
          <Badge variant="outline" className="border-primary text-primary">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      default:
        return null;
    }
  };
  return <>{getStatusBadge(status)}</>;
};

export default StatusBadge;
