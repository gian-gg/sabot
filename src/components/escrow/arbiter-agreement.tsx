'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  Shield,
  Star,
  Users,
  XCircle,
} from 'lucide-react';

interface Arbiter {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating: number;
  completedDisputes: number;
  specialties: string[];
  responseTime: string;
  fee: string;
}

interface ArbiterAgreementProps {
  arbiter: Arbiter;
  onApprove: () => void;
  onReject: () => void;
  isApproved: boolean;
  isRejected: boolean;
  isPending: boolean;
  proposerName: string;
  disabled?: boolean;
}

export function ArbiterAgreement({
  arbiter,
  onApprove,
  onReject,
  isApproved,
  isRejected,
  isPending,
  proposerName,
  disabled = false,
}: ArbiterAgreementProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
          <Shield className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Arbiter Agreement Required</h3>
          <p className="text-muted-foreground text-sm">
            {proposerName} has proposed an arbiter for this escrow
          </p>
        </div>
      </div>

      {/* Arbiter Card */}
      <Card
        className={`transition-colors ${
          isApproved
            ? 'border-green-200 bg-green-50'
            : isRejected
              ? 'border-red-200 bg-red-50'
              : 'border-orange-200 bg-orange-50'
        }`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={arbiter.avatar} />
                <AvatarFallback>
                  {arbiter.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{arbiter.name}</CardTitle>
                <CardDescription>{arbiter.email}</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-orange-600">{arbiter.fee}</p>
              <p className="text-muted-foreground text-xs">Fee</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isApproved && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Approved
              </Badge>
            )}
            {isRejected && (
              <Badge className="bg-red-100 text-red-800">
                <XCircle className="mr-1 h-3 w-3" />
                Rejected
              </Badge>
            )}
            {isPending && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <Clock className="mr-1 h-3 w-3" />
                Pending Your Decision
              </Badge>
            )}
          </div>

          {/* Arbiter Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{arbiter.rating}</span>
              </div>
              <p className="text-muted-foreground text-xs">Rating</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-sm">
                <Users className="h-4 w-4" />
                <span className="font-medium">{arbiter.completedDisputes}</span>
              </div>
              <p className="text-muted-foreground text-xs">Disputes</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{arbiter.responseTime}</span>
              </div>
              <p className="text-muted-foreground text-xs">Response</p>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <p className="mb-2 text-sm font-medium">Specialties</p>
            <div className="flex flex-wrap gap-1">
              {arbiter.specialties.map((specialty) => (
                <Badge key={specialty} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {isPending && (
            <div className="flex gap-2 border-t pt-4">
              <Button
                onClick={onApprove}
                disabled={disabled}
                className="flex-1"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve Arbiter
              </Button>
              <Button
                variant="outline"
                onClick={onReject}
                disabled={disabled}
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}

          {/* Approved/Rejected Actions */}
          {(isApproved || isRejected) && (
            <div className="border-t pt-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {isApproved
                    ? 'You have approved this arbiter. The arbiter will be notified and can now oversee this escrow.'
                    : 'You have rejected this arbiter. The other party will need to propose a different arbiter.'}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agreement Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Once you approve this arbiter, they will
          have the authority to resolve any disputes in this escrow. The
          arbiter&apos;s decision is final and cannot be appealed.
        </AlertDescription>
      </Alert>
    </div>
  );
}
