'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import StatusBadge from '@/components/admin/status-badge';
import { formatDate } from '@/lib/utils/helpers';
import { idOptions } from '@/constants/verify';
import type { IdType, VerificationRequests } from '@/types/verify';

type VerificationTableProps = {
  requests: VerificationRequests[];
  onReview: (request: VerificationRequests) => void;
};

const getIdTypeLabel = (idType: IdType) => {
  return idOptions.find((opt) => opt.id === idType)?.label || idType;
};

const getFaceMatchColor = (confidence: number) => {
  if (confidence >= 0.85) return 'bg-primary';
  if (confidence >= 0.7) return 'bg-yellow-500';
  return 'bg-destructive';
};

const VerificationTable: React.FC<VerificationTableProps> = ({
  requests,
  onReview,
}) => {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                ID Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Submitted
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Face Match
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <p className="text-muted-foreground">
                    No verification requests found
                  </p>
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr
                  key={request.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{request.userName}</span>
                      <span className="text-muted-foreground text-xs">
                        {request.userEmail}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {getIdTypeLabel(
                        request.governmentIdInfo.idType || 'passport'
                      )}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {request.faceMathchConfidence !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                          <div
                            className={`h-full ${getFaceMatchColor(request.faceMathchConfidence)}`}
                            style={{
                              width: `${request.faceMathchConfidence * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs">
                          {(request.faceMathchConfidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => onReview(request)}
                    >
                      <Eye className="h-3 w-3" />
                      Review
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VerificationTable;
