export type AgreementStatus =
  | 'waiting_for_participant'
  | 'in-progress'
  | 'finalized'
  | 'cancelled';

export type AgreementType =
  | 'Partnership'
  | 'Service'
  | 'NDA'
  | 'Sales'
  | 'Custom';

export type ParticipantRole = 'creator' | 'invitee';

// Database agreement types
export interface DBAgreement {
  id: string;
  creator_id: string;
  status: AgreementStatus;
  title?: string;
  agreement_type?: AgreementType;
  created_at: string;
  updated_at: string;
}

export interface AgreementParticipant {
  id: string;
  agreement_id: string;
  user_id: string;
  role: ParticipantRole;
  has_confirmed: boolean;
  joined_at: string;
  // Enriched profile fields (added by API)
  name?: string;
  email?: string;
  avatar?: string;
}

export interface AgreementContent {
  id: string;
  agreement_id: string;
  content?: string;
  idea_blocks?: IdeaBlock[];
  created_at: string;
  updated_at: string;
}

export interface IdeaBlock {
  id: string;
  title: string;
  content: string;
  template?: string;
}

export interface AgreementWithParticipants extends DBAgreement {
  participants: AgreementParticipant[];
  content?: AgreementContent;
}

export interface CreateAgreementPayload {
  title?: string;
  agreement_type?: AgreementType;
}

export interface JoinAgreementPayload {
  agreement_id: string;
}

export interface UpdateAgreementConfirmationPayload {
  agreement_id: string;
  has_confirmed: boolean;
}

export interface UpdateAgreementContentPayload {
  agreement_id: string;
  content?: string;
  idea_blocks?: IdeaBlock[];
}

export interface AgreementStatusResponse {
  agreement: DBAgreement;
  participants: AgreementParticipant[];
  current_user_role?: ParticipantRole;
  is_ready_for_next_step: boolean;
}
