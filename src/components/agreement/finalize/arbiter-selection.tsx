'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Check, X, Search, Loader2, AlertCircle } from 'lucide-react';

interface ArbiterCandidate {
  id: string;
  name: string;
  email: string;
  specializations: string[];
  completedCases: number;
  rating: number;
  avatar?: string;
}

interface ArbiterSelectionProps {
  initiatorId: string;
  participantId: string;
  initiatorName?: string;
  participantName?: string;
  onArbiterSelected: (arbiterId: string) => void;
}

/**
 * ArbiterSelection Component
 *
 * Allows both parties to propose and agree on an arbiter.
 * Both parties must confirm the same arbiter before assignment.
 *
 * Flow:
 * 1. Either party searches for and proposes an arbiter
 * 2. Other party reviews and either approves or suggests different arbiter
 * 3. Once both agree on same arbiter, they're assigned
 */
export function ArbiterSelection({
  initiatorId,
  initiatorName,
  participantName,
  onArbiterSelected,
}: ArbiterSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [candidates, setCandidates] = useState<ArbiterCandidate[]>([]);
  const [proposedArbiter, setProposedArbiter] =
    useState<ArbiterCandidate | null>(null);
  const [initiatorApproved, setInitiatorApproved] = useState(false);
  const [participantApproved, setParticipantApproved] = useState(false);

  const currentUserId = initiatorId; // TODO: Get from auth context
  const isInitiator = currentUserId === initiatorId;

  // Mock arbiter search (in production, this would call an API)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    // Simulate API call
    setTimeout(() => {
      const mockCandidates: ArbiterCandidate[] = [
        {
          id: 'arb-1',
          name: 'Dr. Sarah Chen',
          email: 'sarah.chen@sabot-arbiters.com',
          specializations: ['Technology', 'Intellectual Property', 'Services'],
          completedCases: 147,
          rating: 4.9,
        },
        {
          id: 'arb-2',
          name: 'James Rodriguez',
          email: 'j.rodriguez@sabot-arbiters.com',
          specializations: ['Real Estate', 'Construction', 'Commercial'],
          completedCases: 203,
          rating: 4.8,
        },
        {
          id: 'arb-3',
          name: 'Emily Thompson',
          email: 'e.thompson@sabot-arbiters.com',
          specializations: ['Digital Assets', 'Cryptocurrency', 'NFTs'],
          completedCases: 89,
          rating: 4.7,
        },
      ];

      setCandidates(mockCandidates);
      setIsSearching(false);
    }, 1000);
  };

  const handleProposeArbiter = (candidate: ArbiterCandidate) => {
    setProposedArbiter(candidate);
    // Auto-approve for the proposing party
    if (isInitiator) {
      setInitiatorApproved(true);
      setParticipantApproved(false);
    } else {
      setParticipantApproved(true);
      setInitiatorApproved(false);
    }
  };

  const handleApprove = () => {
    if (!proposedArbiter) return;

    if (isInitiator) {
      setInitiatorApproved(true);
    } else {
      setParticipantApproved(true);
    }

    // If both approved, finalize selection
    if (
      (isInitiator && participantApproved) ||
      (!isInitiator && initiatorApproved)
    ) {
      onArbiterSelected(proposedArbiter.id);
    }
  };

  const handleReject = () => {
    setProposedArbiter(null);
    setInitiatorApproved(false);
    setParticipantApproved(false);
  };

  const bothApproved = initiatorApproved && participantApproved;

  return (
    <Card className="mx-auto max-w-4xl">
      <div className="border-b p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950">
            <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Select Arbiter</h3>
            <p className="text-muted-foreground text-sm">
              Both parties must agree on an arbiter
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-[500px] overflow-auto [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-green-500 [&::-webkit-scrollbar-thumb]:hover:bg-green-600 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800">
        <div className="space-y-6 px-6 py-6">
          {/* Agreement Status */}
          {proposedArbiter && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Agreement Status:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      {initiatorName || 'Initiator'}:
                    </span>
                    {initiatorApproved ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      {participantName || 'Participant'}:
                    </span>
                    {participantApproved ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Success State */}
          {bothApproved && proposedArbiter && (
            <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Arbiter Agreed!</strong> {proposedArbiter.name} will be
                assigned when the agreement is finalized.
              </AlertDescription>
            </Alert>
          )}

          {/* Search Section */}
          {!proposedArbiter && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="arbiter-search">Search for Arbiters</Label>
                  <Input
                    id="arbiter-search"
                    placeholder="Search by name, specialization, or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="mt-7"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Candidates List */}
              {candidates.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">Available Arbiters:</p>
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10">
                            {candidate.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {candidate.specializations.join(', ')}
                          </p>
                          <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                            <span>{candidate.completedCases} cases</span>
                            <span>⭐ {candidate.rating}/5.0</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleProposeArbiter(candidate)}
                      >
                        Propose
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Proposed Arbiter */}
          {proposedArbiter && !bothApproved && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Proposed Arbiter:</p>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-amber-100 dark:bg-amber-900">
                        {proposedArbiter.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{proposedArbiter.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {proposedArbiter.specializations.join(', ')}
                      </p>
                      <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                        <span>{proposedArbiter.completedCases} cases</span>
                        <span>⭐ {proposedArbiter.rating}/5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Approval Actions */}
                  {((isInitiator && !initiatorApproved) ||
                    (!isInitiator && !participantApproved)) && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleReject}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                      <Button size="sm" onClick={handleApprove}>
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {((isInitiator && initiatorApproved && !participantApproved) ||
                (!isInitiator &&
                  participantApproved &&
                  !initiatorApproved)) && (
                <p className="text-muted-foreground text-sm">
                  Waiting for other party to approve...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
