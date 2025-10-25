'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  formatDeliverableValue,
  getConfidenceScoreColor,
  getDeliverableStatusConfig,
  getDeliverableTypeConfig,
  getOracleTypeConfig,
} from '@/lib/escrow/deliverable-status';
import type {
  Deliverable,
  EscrowProof,
  OracleVerification,
} from '@/types/escrow';
import {
  CheckCircle,
  CreditCard,
  DollarSign,
  FileText,
  Layers,
  Package,
  Upload,
  User,
  Wrench,
} from 'lucide-react';
import React from 'react';
import { SubmitProofDialog } from './submit-proof-dialog';

interface DeliverableStatusProps {
  deliverable: Deliverable;
  verification?: OracleVerification;
  proofs?: EscrowProof[];
  partyName: string;
  currentUserId?: string;
  escrow?: { initiator_id: string; participant_id?: string };
  onProofSubmitted?: () => void;
  disabled?: boolean;
}

// Get deliverable type icon
const getDeliverableIcon = (type: string) => {
  switch (type) {
    case 'cash':
      return DollarSign;
    case 'digital_transfer':
      return CreditCard;
    case 'item':
      return Package;
    case 'service':
      return Wrench;
    case 'digital':
    case 'document':
      return FileText;
    case 'mixed':
      return Layers;
    default:
      return Package;
  }
};

export function DeliverableStatus({
  deliverable,
  verification,
  proofs = [],
  partyName,
  currentUserId,
  escrow,
  onProofSubmitted,
  disabled = false,
}: DeliverableStatusProps) {
  const statusConfig = getDeliverableStatusConfig(deliverable.status);
  const oracleType = getOracleTypeForDeliverable(deliverable);
  const oracleConfig = getOracleTypeConfig(oracleType);
  const deliverableConfig = getDeliverableTypeConfig(deliverable.type);

  // Add null checks to prevent runtime errors
  if (!statusConfig || !oracleConfig || !deliverableConfig) {
    console.error('Missing configuration for deliverable:', {
      status: deliverable.status,
      type: deliverable.type,
      oracleType,
      statusConfig,
      oracleConfig,
      deliverableConfig,
    });
    return null;
  }

  // Helper function to determine oracle type
  function getOracleTypeForDeliverable(
    deliverable: Deliverable
  ): 'ipfs' | 'ai' | 'manual' {
    switch (deliverable.type) {
      case 'digital':
      case 'document':
        return 'ipfs';
      case 'service':
        return 'ai';
      default:
        return 'manual';
    }
  }

  const StatusIcon = statusConfig.icon;
  const DeliverableIcon = getDeliverableIcon(deliverable.type);

  // Calculate progress based on status
  const getProgress = () => {
    switch (deliverable.status) {
      case 'pending':
        return 0;
      case 'in_progress':
        return 25;
      case 'submitted':
        return 50;
      case 'verified':
        return 100;
      case 'completed':
        return 100;
      case 'failed':
        return 0;
      default:
        return 0;
    }
  };

  const progress = getProgress();

  // Check if user can submit proof
  const canSubmitProof =
    currentUserId &&
    escrow &&
    ((currentUserId === escrow.initiator_id &&
      deliverable.party_responsible === 'initiator') ||
      (currentUserId === escrow.participant_id &&
        deliverable.party_responsible === 'participant'));

  const getCardStyles = () => {
    switch (deliverable.status) {
      case 'completed':
      case 'verified':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'in_progress':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      case 'failed':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      default:
        return 'border-gray-200 dark:border-gray-800';
    }
  };

  const config = getDeliverableStatusConfig(deliverable.status);

  return (
    <Card className={`transition-colors ${getCardStyles()}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${config.bgColor} ${config.color}`}
            >
              {React.createElement(StatusIcon, { size: 16 })}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{deliverable.description}</h4>
                <Badge variant="outline" className="text-xs">
                  {deliverable.party_responsible === 'initiator'
                    ? 'Initiator'
                    : 'Participant'}
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  {React.createElement(oracleConfig.icon, {
                    className: 'h-3 w-3',
                  })}
                  {oracleConfig.label}
                </Badge>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                {React.createElement(DeliverableIcon, { className: 'h-3 w-3' })}
                <span>{deliverableConfig.label}</span>
                {formatDeliverableValue(deliverable) && (
                  <span className="font-medium text-green-600">
                    {formatDeliverableValue(deliverable)}
                  </span>
                )}
              </div>
              <div className="text-muted-foreground flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{partyName}</span>
                </div>
                {proofs.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    <span>
                      {proofs.length} proof{proofs.length > 1 ? 's' : ''}{' '}
                      submitted
                    </span>
                  </div>
                )}
                {verification && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>
                      Verified{' '}
                      {new Date(verification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">{statusConfig.label}</div>
            {verification?.confidence_score && (
              <div
                className={`text-xs ${getConfidenceScoreColor(verification.confidence_score)}`}
              >
                {verification.confidence_score}% confidence
              </div>
            )}
            {verification?.notes && (
              <div className="text-muted-foreground mt-1 max-w-32 truncate text-xs">
                {verification.notes}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Action Buttons */}
        {canSubmitProof && deliverable.status === 'pending' && (
          <div className="mt-3 border-t pt-3">
            <div className="flex gap-2">
              <SubmitProofDialog
                deliverable={deliverable}
                onProofSubmitted={onProofSubmitted}
              >
                <Button size="sm" disabled={disabled} className="flex-1">
                  <Upload className="mr-1 h-3 w-3" />
                  Submit Proof
                </Button>
              </SubmitProofDialog>
            </div>
          </div>
        )}

        {canSubmitProof && deliverable.status === 'submitted' && (
          <div className="mt-3 border-t pt-3">
            <div className="flex gap-2">
              <SubmitProofDialog
                deliverable={deliverable}
                onProofSubmitted={onProofSubmitted}
              >
                <Button
                  size="sm"
                  variant="outline"
                  disabled={disabled}
                  className="flex-1"
                >
                  <Upload className="mr-1 h-3 w-3" />
                  Update Proof
                </Button>
              </SubmitProofDialog>
            </div>
          </div>
        )}

        {deliverable.status === 'failed' && canSubmitProof && (
          <div className="mt-3 border-t pt-3">
            <div className="flex gap-2">
              <SubmitProofDialog
                deliverable={deliverable}
                onProofSubmitted={onProofSubmitted}
              >
                <Button
                  size="sm"
                  variant="outline"
                  disabled={disabled}
                  className="flex-1"
                >
                  <Upload className="mr-1 h-3 w-3" />
                  Resubmit Proof
                </Button>
              </SubmitProofDialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
