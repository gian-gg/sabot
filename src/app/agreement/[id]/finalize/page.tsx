'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Check, X, Loader2, ChevronDown, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  EscrowProtectionEnhanced,
  type EnhancedEscrowData,
} from '@/components/agreement/finalize/escrow-protection-enhanced';
import { AgreementDetails } from '@/components/agreement/id/agreement-details';
import { DocumentStructure } from '@/components/agreement/id/document-structure';
import { AISuggestions } from '@/components/agreement/id/ai-suggestions';
import { useDocumentStore } from '@/store/document/documentStore';

interface Party {
  id: string;
  name: string;
  email: string;
  color: string;
  verified?: boolean;
  hasConfirmed?: boolean;
  trustScore?: number;
  role?: string;
}

interface DetailItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Section {
  id: string;
  title: string;
  children?: Section[];
}

interface Suggestion {
  id: string;
  type: 'risk' | 'grammar' | 'clause' | 'structure' | string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
}

interface AgreementData {
  id: string;
  title?: string;
  content?: string;
  parties?: Party[];
  details?: DetailItem[];
  structure?: Section[];
  suggestions?: Suggestion[];
}

export default function FinalizePage({ params }: { params: { id: string } }) {
  const router = useRouter();

  // Get document from store
  const { title: storedTitle, content: storedContent } = useDocumentStore();

  // State for parties confirmation
  const [parties, setParties] = useState<Party[]>([]);
  const [currentUserConfirmed, setCurrentUserConfirmed] = useState(false);
  const [escrowEnabled, setEscrowEnabled] = useState(false);
  const [escrowData, setEscrowData] = useState<EnhancedEscrowData | null>(null);

  // Mock data - replace with real data from API/database
  const agreementData: AgreementData = {
    id: params.id,
    title: storedTitle || 'Partnership Agreement',
    content: storedContent || '',
    parties: [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        color: '#1DB954',
        verified: true,
        hasConfirmed: false,
        trustScore: 95,
        role: 'Creator',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        color: '#FF6B6B',
        verified: true,
        hasConfirmed: false,
        trustScore: 88,
        role: 'Invitee',
      },
    ],
  };

  const currentUserId = '1'; // This should come from auth context
  const participantId = '2'; // This should be determined dynamically

  // Initialize parties from agreement data
  const displayParties =
    parties.length > 0
      ? parties
      : agreementData.parties?.map((p) => ({ ...p, hasConfirmed: false })) ||
        [];

  const handleConfirm = () => {
    if (escrowEnabled && escrowData) {
      console.log('Creating escrow with data:', escrowData);
      // API call to create escrow will be added
    }

    setCurrentUserConfirmed(true);
    setParties(
      displayParties.map((party) =>
        party.id === currentUserId ? { ...party, hasConfirmed: true } : party
      )
    );
  };

  const handleCancel = () => {
    router.push(`/agreement/${params.id}/active`);
  };

  const allConfirmed = displayParties.every((party) => party.hasConfirmed);
  const waitingForOthers = currentUserConfirmed && !allConfirmed;

  // Validation for escrow
  const isEscrowValid =
    !escrowEnabled ||
    (escrowData?.deliverables &&
      escrowData.deliverables.length > 0 &&
      escrowData.deliverables.every((d) => d.description.trim().length > 0));

  const canConfirm = isEscrowValid;

  const handleReportIssue = () => {
    // TODO: Open report modal or navigate to report page
    console.log('Report issue for agreement:', params.id);
  };

  const handleUserProfile = (userId: string) => {
    // TODO: Navigate to user profile
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Main Content with top padding for fixed header from root layout */}
      <div className="container mx-auto max-w-7xl px-4 py-6 pt-20 pb-8">
        {/* Status Banner */}
        {waitingForOthers && (
          <Card className="bg-primary/5 border-primary/20 mb-8 p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
              <div>
                <h3 className="text-foreground font-semibold">
                  Waiting for other parties to confirm
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  You&apos;ve confirmed the agreement. We&apos;re waiting for{' '}
                  {displayParties
                    .filter((p) => !p.hasConfirmed)
                    .map((p) => p.name)
                    .join(', ')}{' '}
                  to confirm.
                </p>
              </div>
            </div>
          </Card>
        )}

        {allConfirmed && (
          <Card className="bg-primary/10 border-primary/30 mb-8 p-6">
            <div className="flex items-center gap-3">
              <Check className="text-primary h-5 w-5" />
              <div>
                <h3 className="text-foreground font-semibold">
                  Agreement Finalized!
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  All parties have confirmed. The agreement is now locked and
                  ready for download.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Full Width Confirmation Card - Primary Focus */}
        <Card className="border-primary/30 from-primary/5 to-background mb-12 overflow-hidden border-2 bg-gradient-to-br shadow-lg">
          <div className="p-8">
            {/* Header Section */}
            <div className="mb-8 flex items-start gap-4">
              <div className="bg-primary/20 rounded-xl p-3">
                <Check className="text-primary h-7 w-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-foreground mb-1 text-2xl font-bold">
                  Finalize Agreement
                </h2>
                <p className="text-muted-foreground">
                  Review and confirm your agreement with all parties
                </p>
              </div>
            </div>

            {/* Party Confirmations Grid */}
            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {displayParties.map((party) => (
                <button
                  key={party.id}
                  onClick={() => handleUserProfile(party.id)}
                  className="bg-card/50 hover:bg-card/80 border-border cursor-pointer rounded-lg border p-4 text-left transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-1 items-center gap-3">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: party.color }}
                      >
                        {party.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-sm font-semibold">
                          {party.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {party.email}
                        </p>
                      </div>
                    </div>
                    {party.hasConfirmed ? (
                      <div className="text-primary flex flex-shrink-0 items-center gap-1">
                        <Check className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="text-muted-foreground flex-shrink-0 text-xs font-medium">
                        Pending
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="border-border mb-8 border-t" />

            {/* Action Buttons */}
            {!currentUserConfirmed ? (
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCancel}
                  className="max-w-xs flex-1"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className="max-w-xs flex-1"
                  title={
                    !isEscrowValid ? 'Complete escrow details to continue' : ''
                  }
                >
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Agreement
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-lg px-4 py-2">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    You have confirmed this agreement
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Secondary Content - Collapsible Sections */}
        <div className="space-y-6">
          {/* Escrow Protection (Optional) - Enhanced */}
          <EscrowProtectionEnhanced
            enabled={escrowEnabled}
            onEnabledChange={setEscrowEnabled}
            onEscrowDataChange={setEscrowData}
            agreementTitle={agreementData.title}
            agreementTerms="Review agreement terms before finalizing."
            initiatorId={currentUserId}
            participantId={participantId}
            initiatorName={
              displayParties.find((p) => p.id === currentUserId)?.name
            }
            participantName={
              displayParties.find((p) => p.id === participantId)?.name
            }
          />

          {/* Document Structure - Full Width */}
          <DocumentStructure structure={agreementData.structure} />

          {/* Collapsible Sections */}
          <Accordion type="single" collapsible className="space-y-3">
            {/* Agreement Details Accordion */}
            <AccordionItem
              value="agreement-details"
              className="border-border bg-card/30 rounded-lg border px-6 py-0"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <ChevronDown className="text-primary h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-foreground font-semibold">
                      Agreement Details
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Metadata and key information
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="overflow-visible pt-0 pb-4">
                <div className="pl-11">
                  <AgreementDetails details={agreementData.details} />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* AI Suggestions Accordion */}
            <AccordionItem
              value="ai-suggestions"
              className="border-border bg-card/30 rounded-lg border px-6 py-0"
            >
              <AccordionTrigger className="py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <ChevronDown className="text-primary h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-foreground font-semibold">
                      AI Suggestions
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Review recommendations for improvement
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="overflow-visible pt-0 pb-4">
                <div className="pl-11">
                  <AISuggestions suggestions={agreementData.suggestions} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Report Issue Button */}
          <div className="mt-6 flex justify-center">
            <Button
              variant="ghost"
              onClick={handleReportIssue}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            >
              <Flag className="mr-2 h-4 w-4" />
              Report an Issue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
