'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { ActiveContractsSection } from './active-contracts-section';

import type { AgreementWithParticipants } from '@/types/agreement';

export default function AgreementsSection({
  recentAgreements,
}: {
  recentAgreements: AgreementWithParticipants[];
}) {
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter agreements based on search query
  const filteredAgreements = useMemo(() => {
    if (!searchQuery.trim()) return recentAgreements;

    const query = searchQuery.toLowerCase();
    return recentAgreements.filter((agreement) => {
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
  }, [recentAgreements, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agreements</h2>
          <p className="text-muted-foreground mt-1">
            Manage and keep track of your contracts
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Agreements</CardTitle>
              <CardDescription>
                View and manage your recent agreements
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search agreements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Agreement List */}
          <div className="space-y-2">
            {filteredAgreements.length === 0 ? (
              <div className="text-muted-foreground flex items-center justify-center py-8">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 opacity-50" />
                  <p className="mt-2">
                    {searchQuery
                      ? 'No agreements found matching your search.'
                      : 'No agreements found.'}
                  </p>
                </div>
              </div>
            ) : (
              filteredAgreements.map((agreement) => (
                <Card key={agreement.id} className="border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <FileText className="text-muted-foreground h-5 w-5" />
                          <div>
                            <h3 className="font-medium">
                              {agreement.title || 'Untitled Agreement'}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {agreement.agreement_type} • Created{' '}
                              {new Date(
                                agreement.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
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
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Contracts Section */}
      <ActiveContractsSection agreements={recentAgreements} />
    </div>
  );
}
