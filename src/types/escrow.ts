/**
 * Escrow Types and Interfaces
 *
 * Defines the structure for escrow-protected transactions in Sabot.
 * These types support both digital and physical deliverables with optional arbiter verification.
 */

export type EscrowStatus =
  | 'pending' // Escrow created, waiting for both parties to join
  | 'active' // Both parties joined, transaction in progress
  | 'awaiting_confirmation' // One party confirmed, waiting for other
  | 'completed' // Both parties confirmed, escrow released
  | 'disputed' // Dispute raised, arbiter requested
  | 'arbiter_review' // Arbiter is reviewing the case
  | 'cancelled' // Transaction cancelled
  | 'expired'; // Escrow expired without completion

export type EscrowType =
  | 'cash' // Cash payment
  | 'digital_transfer' // Digital/bank transfer payment
  | 'item' // Physical item exchange
  | 'service' // Service delivery
  | 'digital' // Digital deliverable
  | 'document' // Document/paper exchange
  | 'mixed'; // Multiple deliverable types

export type PartyResponsible = 'initiator' | 'participant';

export interface Deliverable {
  id: string;
  escrow_id: string;
  type: EscrowType;
  description: string;
  quantity?: number;
  value?: number; // Amount (only for cash/digital_transfer types)
  currency?: string; // Currency (only for cash/digital_transfer types)
  party_responsible: PartyResponsible; // Which party is responsible for this deliverable
  status: DeliverableStatus;
  created_at: string;
  updated_at: string;
}

export type DeliverableStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'verified'
  | 'completed'
  | 'failed';

export type PartyRole = 'initiator' | 'participant';

export type ConfirmationStatus = 'pending' | 'confirmed' | 'disputed';

/**
 * Core escrow transaction interface
 */
export interface Escrow {
  id: string;
  transaction_id?: string; // Optional link to existing transaction
  agreement_id?: string; // Optional link to existing agreement
  type: EscrowType;
  status: EscrowStatus;

  // Parties
  initiator_id: string;
  participant_id?: string;

  // Transaction details
  title: string;
  description: string;

  // Deliverable details (separated by party, payment types have amounts)
  deliverables?: Deliverable[]; // Array of deliverables with party responsibility
  expected_completion_date?: string;

  // Confirmation tracking
  initiator_confirmation: ConfirmationStatus;
  participant_confirmation: ConfirmationStatus;
  initiator_confirmed_at?: string;
  participant_confirmed_at?: string;

  // Arbiter/Oracle
  arbiter_requested: boolean;
  arbiter_id?: string;
  arbiter_proposed_by?: string; // Who proposed this arbiter
  arbiter_initiator_approved: boolean; // Initiator's approval
  arbiter_participant_approved: boolean; // Participant's approval
  arbiter_decision?: 'release' | 'refund' | 'split' | 'pending';
  arbiter_notes?: string;

  // Timestamps
  created_at: string;
  updated_at: string;
  completed_at?: string;
  expires_at?: string;

  // Metadata
  terms_hash?: string; // Hash of agreement terms (for blockchain)
  blockchain_tx_id?: string; // Future blockchain transaction ID
  ai_analysis_data?: Array<{
    user_id: string;
    analysis_data: {
      confidence: number;
      extracted_data: Record<string, unknown>;
    };
    created_at: string;
  }>; // AI analysis data from transaction screenshots
}

/**
 * Extended escrow with participant details
 */
export interface EscrowWithParticipants extends Escrow {
  initiator: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isVerified: boolean;
  };
  participant?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isVerified: boolean;
  };
  arbiter?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Escrow with deliverables and their status
 */
export interface EscrowWithDeliverables extends EscrowWithParticipants {
  deliverables: Deliverable[];
}

/**
 * Deliverable with verification status
 */
export interface DeliverableWithStatus extends Deliverable {
  verification?: OracleVerification;
  proofs?: EscrowProof[];
}

/**
 * Oracle verification result
 */
export interface OracleVerification {
  id: string;
  escrow_id: string;
  oracle_type: 'ipfs' | 'ai';
  verified: boolean;
  confidence_score?: number;
  proof_hash: string;
  notes?: string;
  created_at: string;
}

/**
 * Escrow proof submission
 */
export interface EscrowProof {
  id: string;
  escrow_id: string;
  deliverable_id: string;
  proof_hash: string;
  proof_description?: string;
  submitted_by: string;
  submitted_at: string;
}

/**
 * Escrow timeline event
 */
export interface EscrowEvent {
  id: string;
  escrow_id: string;
  event_type:
    | 'created'
    | 'participant_joined'
    | 'status_changed'
    | 'initiator_confirmed'
    | 'participant_confirmed'
    | 'arbiter_requested'
    | 'arbiter_assigned'
    | 'arbiter_decision'
    | 'completed'
    | 'cancelled'
    | 'disputed';
  actor_id: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Payload for creating a new escrow
 */
export interface CreateEscrowPayload {
  title: string;
  description: string;
  deliverables: Deliverable[]; // Array with party responsibility and optional amounts
  expected_completion_date?: string;
  arbiter_required?: boolean; // Special escrow version with pre-assigned arbiter
  arbiter_id?: string; // Selected arbiter ID
  transaction_id?: string;
  agreement_id?: string;
  participant_email?: string; // Optional: invite specific participant
}

/**
 * Payload for joining an escrow
 */
export interface JoinEscrowPayload {
  escrow_id: string;
}

/**
 * Payload for confirming completion
 */
export interface ConfirmEscrowPayload {
  escrow_id: string;
  confirmation_notes?: string;
}

/**
 * Payload for requesting arbiter
 */
export interface RequestArbiterPayload {
  escrow_id: string;
  dispute_reason: string;
  dispute_details: string;
  evidence_urls?: string[];
}

/**
 * Payload for arbiter decision
 */
export interface ArbiterDecisionPayload {
  escrow_id: string;
  decision: 'release' | 'refund' | 'split';
  notes: string;
  split_percentage?: number; // If decision is 'split'
}

/**
 * Escrow status response from API
 */
export interface EscrowStatusResponse {
  escrow: EscrowWithParticipants;
  events: EscrowEvent[];
  current_user_role?: PartyRole;
  can_confirm: boolean;
  can_dispute: boolean;
  can_cancel: boolean;
}

/**
 * Escrow statistics for user dashboard
 */
export interface EscrowStats {
  total_escrows: number;
  active_escrows: number;
  completed_escrows: number;
  total_value: number;
  currency: string;
}
