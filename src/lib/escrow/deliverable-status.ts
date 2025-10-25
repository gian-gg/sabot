/**
 * Utility functions for calculating deliverable status and progress
 */

import type {
  Deliverable,
  DeliverableWithStatus,
  OracleVerification,
  EscrowProof,
  PartyRole,
} from '@/types/escrow';

/**
 * Calculate the status of a deliverable based on proofs and oracle verifications
 */
export function calculateDeliverableStatus(
  deliverable: Deliverable,
  proofs: EscrowProof[] = [],
  verifications: OracleVerification[] = []
): Deliverable['status'] {
  const deliverableProofs = proofs.filter(
    (p) => p.deliverable_id === deliverable.id
  );
  const deliverableVerifications = verifications.filter((v) =>
    deliverableProofs.some((p) => p.proof_hash === v.proof_hash)
  );

  // If oracle verification exists and is verified, return verified
  const verifiedVerification = deliverableVerifications.find((v) => v.verified);
  if (verifiedVerification) {
    return 'verified';
  }

  // If oracle verification exists but failed, return failed
  const failedVerification = deliverableVerifications.find((v) => !v.verified);
  if (failedVerification) {
    return 'failed';
  }

  // If proof submitted but no verification yet, return submitted
  if (deliverableProofs.length > 0 && deliverableVerifications.length === 0) {
    return 'submitted';
  }

  // If proof submitted and verification in progress, return in_progress
  if (deliverableProofs.length > 0 && deliverableVerifications.length > 0) {
    return 'in_progress';
  }

  // Default to pending
  return 'pending';
}

/**
 * Get overall progress percentage for a set of deliverables
 */
export function getOverallProgress(
  deliverables: DeliverableWithStatus[]
): number {
  if (deliverables.length === 0) return 0;

  const completedCount = deliverables.filter(
    (d) => d.status === 'completed' || d.status === 'verified'
  ).length;

  return Math.round((completedCount / deliverables.length) * 100);
}

/**
 * Get oracle verification summary statistics
 */
export function getOracleVerificationSummary(
  verifications: OracleVerification[]
) {
  const total = verifications.length;
  const verified = verifications.filter((v) => v.verified).length;
  const failed = verifications.filter((v) => !v.verified).length;
  const pending = total - verified - failed;

  return {
    total,
    verified,
    failed,
    pending,
    successRate: total > 0 ? Math.round((verified / total) * 100) : 0,
  };
}

/**
 * Check if a user can submit proof for a deliverable
 */
export function canSubmitProof(
  deliverable: Deliverable,
  currentUserId: string,
  escrow: { initiator_id: string; participant_id?: string }
): boolean {
  // Check if user is responsible for this deliverable
  const isInitiator = currentUserId === escrow.initiator_id;
  const isParticipant = currentUserId === escrow.participant_id;

  if (!isInitiator && !isParticipant) {
    return false;
  }

  // Check if user is the responsible party
  const isResponsible =
    (isInitiator && deliverable.party_responsible === 'initiator') ||
    (isParticipant && deliverable.party_responsible === 'participant');

  if (!isResponsible) {
    return false;
  }

  // Can only submit if status is pending or in_progress
  return (
    deliverable.status === 'pending' || deliverable.status === 'in_progress'
  );
}

/**
 * Get deliverable status display configuration
 */
export function getDeliverableStatusConfig(status: Deliverable['status']) {
  const configs = {
    pending: {
      label: 'Pending',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      icon: 'Package',
    },
    in_progress: {
      label: 'In Progress',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: 'Clock',
    },
    submitted: {
      label: 'Submitted',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: 'Upload',
    },
    verified: {
      label: 'Verified',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: 'CheckCircle',
    },
    completed: {
      label: 'Completed',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: 'CheckCircle',
    },
    failed: {
      label: 'Failed',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: 'XCircle',
    },
  };

  return configs[status];
}

/**
 * Get oracle type configuration for display
 */
export function getOracleTypeConfig(oracleType: 'ipfs' | 'ai' | 'manual') {
  const configs = {
    ipfs: {
      label: 'IPFS',
      description: 'File verification',
      icon: 'FileText',
      color: 'text-blue-600',
    },
    ai: {
      label: 'AI',
      description: 'AI verification',
      icon: 'Bot',
      color: 'text-purple-600',
    },
    manual: {
      label: 'Manual',
      description: 'Manual review',
      icon: 'User',
      color: 'text-gray-600',
    },
  };

  return configs[oracleType];
}

/**
 * Determine oracle type based on deliverable type
 */
export function getOracleTypeForDeliverable(
  deliverable: Deliverable
): 'ipfs' | 'ai' | 'manual' {
  switch (deliverable.type) {
    case 'digital':
    case 'document':
      return 'ipfs';
    case 'service':
      return 'ai';
    case 'item':
    case 'cash':
    case 'digital_transfer':
    case 'mixed':
    default:
      return 'manual';
  }
}

/**
 * Get deliverable type icon configuration
 */
export function getDeliverableTypeConfig(type: Deliverable['type']) {
  const configs = {
    cash: {
      icon: 'DollarSign',
      label: 'Cash Payment',
      color: 'text-green-600',
    },
    digital_transfer: {
      icon: 'CreditCard',
      label: 'Digital Transfer',
      color: 'text-blue-600',
    },
    item: {
      icon: 'Package',
      label: 'Physical Item',
      color: 'text-orange-600',
    },
    service: {
      icon: 'Wrench',
      label: 'Service',
      color: 'text-purple-600',
    },
    digital: {
      icon: 'FileText',
      label: 'Digital File',
      color: 'text-blue-600',
    },
    document: {
      icon: 'FileText',
      label: 'Document',
      color: 'text-gray-600',
    },
    mixed: {
      icon: 'Layers',
      label: 'Mixed',
      color: 'text-indigo-600',
    },
  };

  return (
    configs[type] || {
      icon: 'Package',
      label: 'Unknown',
      color: 'text-gray-600',
    }
  );
}

/**
 * Calculate confidence score color based on value
 */
export function getConfidenceScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Format deliverable value for display
 */
export function formatDeliverableValue(deliverable: Deliverable): string {
  if (deliverable.value && deliverable.currency) {
    return `${deliverable.currency} ${deliverable.value.toLocaleString()}`;
  }
  if (deliverable.quantity && deliverable.quantity > 1) {
    return `Qty: ${deliverable.quantity}`;
  }
  return '';
}

/**
 * Get party name for display
 */
export function getPartyDisplayName(
  partyResponsible: 'initiator' | 'participant',
  escrow: { initiator: { name: string }; participant?: { name: string } }
): string {
  if (partyResponsible === 'initiator') {
    return escrow.initiator.name;
  }
  return escrow.participant?.name || 'Participant';
}
