'use client';

import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Filter,
  Search,
  TrendingUp,
  Users,
  Handshake,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import StatsCard from '../transactions/stats-card';
import { AgreementDetailsModal } from './agreement-details-modal';

import type { AgreementWithParticipants } from '@/types/agreement';

export default function AgreementsSection({
  recentAgreements,
}: {
  recentAgreements: AgreementWithParticipants[];
}) {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAgreement, setSelectedAgreement] =
    useState<AgreementWithParticipants | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Calculate agreement statistics
  const agreementStats = useMemo(() => {
    const totalAgreements = recentAgreements.length;
    const activeContracts = recentAgreements.filter(
      (agreement) => agreement.status === 'in-progress'
    ).length;
    const completedAgreements = recentAgreements.filter(
      (agreement) => agreement.status === 'finalized'
    ).length;
    const uniquePartners = new Set(
      recentAgreements.flatMap((agreement) =>
        agreement.participants
          .filter((p) => p.role !== 'creator') // Exclude current user as creator
          .map((p) => p.user_id)
      )
    ).size;

    const successRate =
      totalAgreements > 0
        ? Math.round((completedAgreements / totalAgreements) * 100)
        : 0;

    return {
      activeContracts,
      totalAgreements,
      successRate,
      activePartners: uniquePartners,
    };
  }, [recentAgreements]);

  // Filter agreements based on search query and status
  const filteredAgreements = useMemo(() => {
    let filtered = recentAgreements;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (agreement) => agreement.status === statusFilter
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((agreement) => {
        return (
          agreement.title?.toLowerCase().includes(query) ||
          agreement.agreement_type?.toLowerCase().includes(query) ||
          agreement.id.toLowerCase().includes(query) ||
          agreement.participants.some(
            (p) =>
              p.name?.toLowerCase().includes(query) ||
              p.email?.toLowerCase().includes(query)
          )
        );
      });
    }

    return filtered;
  }, [recentAgreements, searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          Icon={FileText}
          title="Active Contracts"
          value={agreementStats.activeContracts.toString()}
          description="Currently in progress"
        />
        <StatsCard
          Icon={Handshake}
          title="Total Agreements"
          value={agreementStats.totalAgreements.toString()}
          description="All time agreements"
        />
        <StatsCard
          Icon={TrendingUp}
          title="Success Rate"
          value={`${agreementStats.successRate}%`}
          description="Finalized agreements"
        />
        <StatsCard
          Icon={Users}
          title="Active Partners"
          value={agreementStats.activePartners.toString()}
          description="Unique collaborators"
        />
      </div>

      {/* Recent Agreements */}
      <div className="mt-6 min-h-[600px] space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Recent Agreements</CardTitle>
            <CardDescription>
              View and manage your recent agreements
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto">
              <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
              <Input
                placeholder="Search agreements..."
                className="bg-background h-10 w-full pl-9 sm:w-[250px]"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  All Agreements
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter('in-progress')}
                >
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setStatusFilter('waiting_for_participant')}
                >
                  Waiting for Participant
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('finalized')}>
                  Finalized
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div>
          <div className="space-y-3">
            {filteredAgreements.length === 0 ? (
              <div className="text-muted-foreground flex min-h-[600px] flex-col items-center justify-center rounded-lg border-2 py-12 text-center">
                <FileText className="mb-3 h-12 w-12 opacity-20" />
                <p className="text-sm font-semibold">No agreements found</p>
                <p className="text-xs">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'Create a new agreement to get started.'}
                </p>
              </div>
            ) : (
              filteredAgreements.map((agreement) => (
                <Card
                  key={agreement.id}
                  className="group border-border/40 hover:border-primary/50 cursor-pointer p-4 transition-all hover:shadow-md"
                  onClick={() => {
                    setSelectedAgreement(agreement);
                    setIsDetailsModalOpen(true);
                  }}
                >
                  <div className="flex gap-3 sm:gap-6">
                    {/* Icon Section */}
                    <div className="shrink-0">
                      <div
                        className={
                          agreement.status === 'finalized'
                            ? 'group-hover:bg-background flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500 transition-colors'
                            : agreement.status === 'in-progress'
                              ? 'group-hover:bg-background flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition-colors'
                              : agreement.status === 'waiting_for_participant'
                                ? 'group-hover:bg-background flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 transition-colors'
                                : 'group-hover:bg-background flex h-12 w-12 items-center justify-center rounded-xl bg-gray-500/10 text-gray-500 transition-colors'
                        }
                      >
                        <FileText className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate pr-2 text-base font-semibold">
                            {agreement.title || 'Untitled Agreement'}
                          </h3>
                          <Badge
                            variant="outline"
                            className="shrink-0 text-[10px] tracking-wider uppercase"
                          >
                            {agreement.agreement_type}
                          </Badge>
                        </div>
                      </div>

                      {/* Footer Meta */}
                      <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          Created{' '}
                          {new Date(agreement.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Right Section - Status */}
                    <div className="flex shrink-0 items-center">
                      <Badge
                        variant="outline"
                        className={
                          agreement.status === 'finalized'
                            ? 'border-green-500/20 bg-green-500/10 text-green-600'
                            : agreement.status === 'in-progress'
                              ? 'border-orange-500/20 bg-orange-500/10 text-orange-600'
                              : agreement.status === 'waiting_for_participant'
                                ? 'border-purple-500/20 bg-purple-500/10 text-purple-600'
                                : 'border-gray-500/20 bg-gray-500/10 text-gray-600'
                        }
                      >
                        {agreement.status === 'waiting_for_participant'
                          ? 'Waiting'
                          : agreement.status === 'in-progress'
                            ? 'In Progress'
                            : agreement.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <AgreementDetailsModal
        agreement={selectedAgreement}
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
    </div>
  );
}
