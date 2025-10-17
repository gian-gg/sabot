// Mock data for agreement platform
// This file contains types and mock data for collaborative agreement creation

export interface Party {
  id: string;
  name: string;
  email: string;
  color: string; // Hex color for cursor/avatar
  verified: boolean;
  hasConfirmed?: boolean;
  isOnline?: boolean;
  cursor?: { x: number; y: number };
  trustScore?: number;
}

export interface Section {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'quote' | 'divider';
  level?: 1 | 2 | 3; // For headings
  content: string;
  order: number;
}

export interface AISuggestion {
  id: string;
  type: 'grammar' | 'clause' | 'risk' | 'improvement';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestedText?: string;
  location?: { sectionId: string; position: number };
}

export type AgreementType =
  | 'Partnership'
  | 'Service'
  | 'NDA'
  | 'Sales'
  | 'Custom';

export type AgreementStatus = 'draft' | 'active' | 'finalized' | 'signed';

export interface Agreement {
  id: string;
  type: AgreementType;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: AgreementStatus;
  parties: Party[];
  sections: Section[];
  aiSuggestions: AISuggestion[];
  duration?: string;
  effectiveDate?: string;
}

// Mock parties
export const mockParties: Party[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    color: '#1DB954',
    verified: true,
    hasConfirmed: false,
    isOnline: true,
    trustScore: 95,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    color: '#FF6B6B',
    verified: true,
    hasConfirmed: false,
    isOnline: true,
    trustScore: 88,
  },
];

// Individual mock users (for v0 compatibility)
export const mockUser: Party = mockParties[0];
export const mockInviter: Party = mockParties[1];

// Mock sections for a partnership agreement
export const mockSections: Section[] = [
  {
    id: 's1',
    type: 'heading',
    level: 1,
    content: 'Partnership Agreement',
    order: 1,
  },
  {
    id: 's2',
    type: 'heading',
    level: 2,
    content: 'Preamble',
    order: 2,
  },
  {
    id: 's3',
    type: 'paragraph',
    content:
      'This Partnership Agreement ("Agreement") is entered into as of the date set forth above by and between the parties identified below, who agree to the terms and conditions set forth herein.',
    order: 3,
  },
  {
    id: 's4',
    type: 'heading',
    level: 2,
    content: 'Definitions',
    order: 4,
  },
  {
    id: 's5',
    type: 'paragraph',
    content:
      'Party A: John Doe, representing ABC Corporation. Party B: Jane Smith, representing XYZ Enterprises. Effective Date: The date on which this Agreement becomes binding.',
    order: 5,
  },
  {
    id: 's6',
    type: 'heading',
    level: 2,
    content: 'Terms and Conditions',
    order: 6,
  },
  {
    id: 's7',
    type: 'heading',
    level: 3,
    content: '1. Scope of Agreement',
    order: 7,
  },
  {
    id: 's8',
    type: 'paragraph',
    content:
      'The parties agree to collaborate on the development and marketing of innovative software solutions for enterprise clients.',
    order: 8,
  },
  {
    id: 's9',
    type: 'heading',
    level: 3,
    content: '2. Obligations',
    order: 9,
  },
  {
    id: 's10',
    type: 'paragraph',
    content:
      'Each party shall contribute resources, expertise, and personnel as outlined in Schedule A attached hereto.',
    order: 10,
  },
  {
    id: 's11',
    type: 'heading',
    level: 2,
    content: 'Signatures',
    order: 11,
  },
];

// Mock AI suggestions
export const mockAISuggestions: AISuggestion[] = [
  {
    id: 'sug1',
    type: 'clause',
    severity: 'medium',
    title: 'Add Force Majeure Clause',
    description:
      'Consider adding a force majeure clause to protect both parties from unforeseen circumstances such as natural disasters or pandemics.',
    suggestedText:
      'Neither party shall be liable for any failure or delay in performance due to events beyond their reasonable control, including but not limited to acts of God, war, strikes, or government actions.',
    location: { sectionId: 's10', position: 10 },
  },
  {
    id: 'sug2',
    type: 'risk',
    severity: 'high',
    title: 'Missing Termination Clause',
    description:
      'This agreement lacks a clear termination clause. Define exit conditions to prevent disputes.',
    suggestedText:
      'Either party may terminate this Agreement upon 30 days written notice to the other party. Upon termination, all obligations shall cease except those explicitly stated to survive.',
  },
  {
    id: 'sug3',
    type: 'clause',
    severity: 'low',
    title: 'Add Confidentiality Provision',
    description:
      'Consider adding a confidentiality clause to protect sensitive business information shared during collaboration.',
    suggestedText:
      'Both parties agree to maintain confidentiality of all proprietary information shared during the course of this partnership.',
  },
  {
    id: 'sug4',
    type: 'improvement',
    severity: 'low',
    title: 'Specify Dispute Resolution',
    description:
      'Add a dispute resolution mechanism (mediation, arbitration) to handle disagreements efficiently.',
    suggestedText:
      'Any disputes arising from this Agreement shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.',
  },
];

// Mock agreements
export const mockAgreements: Agreement[] = [
  {
    id: 'AGR-2025-001',
    type: 'Partnership',
    title: 'Partnership Agreement',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T14:30:00Z',
    status: 'draft',
    parties: mockParties,
    sections: mockSections,
    aiSuggestions: mockAISuggestions,
    duration: '12 months',
    effectiveDate: 'January 15, 2025',
  },
  {
    id: 'AGR-2025-002',
    type: 'Service',
    title: 'Service Agreement',
    createdAt: '2025-01-14T09:00:00Z',
    updatedAt: '2025-01-14T16:45:00Z',
    status: 'active',
    parties: [
      {
        id: '3',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        color: '#509BF5',
        verified: true,
        hasConfirmed: true,
        isOnline: false,
        trustScore: 92,
      },
      {
        id: '4',
        name: 'Bob Williams',
        email: 'bob@example.com',
        color: '#9B59B6',
        verified: true,
        hasConfirmed: false,
        isOnline: true,
        trustScore: 85,
      },
    ],
    sections: [
      {
        id: 'ss1',
        type: 'heading',
        level: 1,
        content: 'Service Agreement',
        order: 1,
      },
      {
        id: 'ss2',
        type: 'paragraph',
        content:
          'This Service Agreement outlines the terms under which services will be provided.',
        order: 2,
      },
    ],
    aiSuggestions: [
      {
        id: 'ssug1',
        type: 'clause',
        severity: 'medium',
        title: 'Add Payment Schedule',
        description:
          'Include a detailed payment schedule with milestones and due dates.',
      },
    ],
    duration: '6 months',
    effectiveDate: 'January 14, 2025',
  },
];

// Helper functions
export function getAgreementById(id: string): Agreement | undefined {
  return mockAgreements.find((agreement) => agreement.id === id);
}

export function getPartiesByAgreementId(id: string): Party[] {
  const agreement = getAgreementById(id);
  return agreement?.parties || [];
}

export function getSectionsByAgreementId(id: string): Section[] {
  const agreement = getAgreementById(id);
  return agreement?.sections || [];
}

export function getAISuggestionsByAgreementId(id: string): AISuggestion[] {
  const agreement = getAgreementById(id);
  return agreement?.aiSuggestions || [];
}

// Template definitions
export interface AgreementTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AgreementType;
}

export const agreementTemplates: AgreementTemplate[] = [
  {
    id: 'template-1',
    name: 'Partnership Agreement',
    description:
      'For business partnerships and joint ventures between two or more parties',
    icon: 'Handshake',
    type: 'Partnership',
  },
  {
    id: 'template-2',
    name: 'Service Agreement',
    description:
      'Define terms for service delivery, payment, and responsibilities',
    icon: 'Briefcase',
    type: 'Service',
  },
  {
    id: 'template-3',
    name: 'Non-Disclosure Agreement (NDA)',
    description: 'Protect confidential information shared between parties',
    icon: 'Lock',
    type: 'NDA',
  },
  {
    id: 'template-4',
    name: 'Sales Agreement',
    description:
      'Formalize terms for the sale of goods or services with payment terms',
    icon: 'ShoppingCart',
    type: 'Sales',
  },
  {
    id: 'template-5',
    name: 'Custom Agreement',
    description: 'Start from scratch and create your own customized agreement',
    icon: 'FileText',
    type: 'Custom',
  },
];
