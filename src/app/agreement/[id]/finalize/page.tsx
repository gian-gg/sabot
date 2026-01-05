'use client';

import {
  EscrowProtectionEnhanced,
  type EnhancedEscrowData,
} from '@/components/agreement/finalize/escrow-protection-enhanced';
import { AgreementDetails } from '@/components/agreement/id/agreement-details';
import { AISuggestions } from '@/components/agreement/id/ai-suggestions';
import { DocumentStructure } from '@/components/agreement/id/document-structure';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAgreementRealtime } from '@/hooks/use-agreement-realtime';
import { createClient } from '@/lib/supabase/client';
import { useDocumentStore } from '@/store/document/documentStore';
import { Check, ChevronDown, Flag, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

interface Party {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  verified?: boolean;
  hasConfirmed?: boolean;
  trustScore?: number;
  role?: string;
  user_id?: string;
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

export default function FinalizePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  console.log('[FinalizePage] Rendered with agreementId:', id);

  // Get document from store
  const { title: storedTitle, content: storedContent } = useDocumentStore();

  // Use realtime hook for live confirmation updates
  console.log('[FinalizePage] About to call useAgreementRealtime with id:', id);
  const {
    participants: realtimeParticipants,
    allConfirmed: realtimeAllConfirmed,
    refetch: refetchParticipants,
  } = useAgreementRealtime({ agreementId: id });
  console.log('[FinalizePage] useAgreementRealtime hook returned:', {
    participantCount: realtimeParticipants.length,
    allConfirmed: realtimeAllConfirmed,
  });

  // State
  const [escrowData, setEscrowData] = useState<EnhancedEscrowData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Agreement data state
  const [agreementData, setAgreementData] = useState<AgreementData>({
    id: id,
    title: 'Loading...',
    content: '',
    parties: [],
  });

  // Get current user from auth
  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        console.log('[FinalizePage] Current user:', user.id);
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch real agreement data from API
  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const response = await fetch(`/api/agreement/${id}/status`);

        if (!response.ok) {
          throw new Error('Failed to fetch agreement');
        }

        const data = await response.json();

        // Map API response to component state
        // Generate colors for parties if not present
        const colors = ['#1DB954', '#FF6B6B', '#4A90E2', '#F5A623'];
        const fetchedParties: Party[] = (data.participants || []).map(
          (
            participant: {
              id: string;
              user_id: string;
              participant_name: string;
              participant_email: string;
              participant_avatar_url?: string;
              role: string;
              has_confirmed?: boolean;
            },
            index: number
          ) => ({
            id: participant.id,
            user_id: participant.user_id,
            name: participant.participant_name,
            email: participant.participant_email,
            avatar: participant.participant_avatar_url,
            color: colors[index % colors.length],
            role: participant.role,
            verified: true,
            hasConfirmed: participant.has_confirmed || false,
            trustScore: 85,
          })
        );

        setAgreementData({
          id: data.agreement.id,
          title: storedTitle || data.agreement.title || 'Agreement',
          content: storedContent || data.agreement.content || '',
          parties: fetchedParties,
        });
      } catch (error) {
        console.error('Error fetching agreement:', error);
        // Fall back to mock data
        setAgreementData({
          id: id,
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
        });
      }
    };

    fetchAgreement();
  }, [id, storedTitle, storedContent]);

  // Map realtime participants to display format
  const displayParties =
    realtimeParticipants.length > 0
      ? realtimeParticipants.map((p) => ({
          id: p.user_id,
          user_id: p.user_id,
          name: p.name || 'Unknown',
          email: p.email || '',
          avatar: p.avatar,
          color:
            agreementData.parties?.find((party) => party.user_id === p.user_id)
              ?.color || '#666',
          verified: true,
          hasConfirmed: p.has_confirmed,
          trustScore: 85,
          role: p.role,
        }))
      : agreementData.parties || [];

  // Determine current user's confirmation status
  const currentUserConfirmed = realtimeParticipants.some(
    (p) => p.user_id === currentUserId && p.has_confirmed
  );

  // Get the other party's ID for UI display
  const participantId = realtimeParticipants.find(
    (p) => p.user_id !== currentUserId
  )?.user_id;

  const handleConfirm = async () => {
    if (!currentUserId) {
      alert('Please log in to confirm the agreement.');
      return;
    }

    if (escrowData) {
      console.log('Creating escrow with data:', escrowData);
      // API call to create escrow will be added
    }

    try {
      const supabase = createClient();

      // Find current user's participant record
      const currentParticipant = realtimeParticipants.find(
        (p) => p.user_id === currentUserId
      );

      if (!currentParticipant) {
        throw new Error('Participant record not found');
      }

      console.log(
        '[handleConfirm] Updating participant:',
        currentParticipant.id
      );

      // Update database directly (like transaction active page)
      const { error } = await supabase
        .from('agreement_participants')
        .update({ has_confirmed: true })
        .eq('id', currentParticipant.id);

      if (error) {
        throw error;
      }

      console.log('[handleConfirm] Database updated successfully');

      // Trigger refetch to update the realtime hook's state
      // The refetch function now returns the updated data immediately
      console.log('[handleConfirm] Triggering refetch of participants...');
      const freshParticipants = await refetchParticipants();

      console.log(
        '[handleConfirm] Participants refetched, fresh data:',
        freshParticipants.map((p) => ({
          id: p.id,
          user_id: p.user_id,
          has_confirmed: p.has_confirmed,
          name: p.name,
        }))
      );

      // Check if ALL participants now confirmed using the fresh data
      const allNowConfirmed = freshParticipants.every((p) => p.has_confirmed);

      console.log(
        '[handleConfirm] All participants confirmed:',
        allNowConfirmed
      );

      if (allNowConfirmed) {
        // Update agreement status to finalized
        const { error: statusError } = await supabase
          .from('agreements')
          .update({ status: 'finalized' })
          .eq('id', id);

        if (statusError) throw statusError;

        console.log('[handleConfirm] Agreement finalized');

        setTimeout(() => {
          router.push(`/agreement/${id}/finalized`);
        }, 2000);
      }
    } catch (error) {
      console.error('[handleConfirm] Error:', error);
      alert('Failed to confirm. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push(`/agreement/${id}/active`);
  };

  const allConfirmed = realtimeAllConfirmed;
  const waitingForOthers = currentUserConfirmed && !allConfirmed;

  // Validation for escrow
  const isEscrowValid =
    !escrowData ||
    (escrowData?.deliverables &&
      escrowData.deliverables.length > 0 &&
      escrowData.deliverables.every((d) => d.description.trim().length > 0));

  const canConfirm = isEscrowValid;

  const handleReportIssue = () => {
    // TODO: Open report modal or navigate to report page
    console.log('Report issue for agreement:', id);
  };

  const handleUserProfile = (userId: string) => {
    // TODO: Navigate to user profile
    router.push(`/profile/${userId}`);
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Main Content with top padding for fixed header from root layout */}
      <div className="container mx-auto max-w-4xl px-6 py-8 pt-24 pb-12">
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
                      {party.avatar ? (
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={party.avatar}
                            alt={party.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                            onError={(result) => {
                              // If image fails to load, hide it and show fallback
                              result.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : null}
                      {!party.avatar && (
                        <div
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: party.color }}
                        >
                          {party.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                      )}
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
            enabled={true}
            onEscrowDataChange={setEscrowData}
            agreementTitle={agreementData.title}
            agreementTerms="Review agreement terms before finalizing."
            initiatorId={currentUserId || ''}
            participantId={participantId || ''}
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
