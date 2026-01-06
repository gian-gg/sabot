'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Star,
  Clock,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface ArbiterCandidate {
  id: string;
  name: string;
  specializations: string[];
  rating: number;
  completedCases: number;
  responseTime: string;
  experience: string;
  isRecommended?: boolean;
}

interface ArbiterSelectionProps {
  initiatorId: string;
  participantId: string;
  initiatorName?: string;
  participantName?: string;
  onArbiterSelected: (arbiterId: string) => void;
  selectedArbiter?: ArbiterCandidate;
  isWaitingForApproval?: boolean;
}

// Helper function to get arbiter image path
const getArbiterImagePath = (name: string): string => {
  // Convert name to filename format
  const fileName = name
    .toLowerCase()
    .replace('dr. ', '') // Remove title
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
  return `/images/${fileName}.jpg`;
};

const RECOMMENDED_ARBITERS: ArbiterCandidate[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    specializations: ['Technology', 'E-commerce', 'Digital Assets'],
    rating: 4.9,
    completedCases: 147,
    responseTime: '< 12 hours',
    experience: '8 years',
    isRecommended: true,
  },
  {
    id: '2',
    name: 'James Rodriguez',
    specializations: ['Real Estate', 'Construction', 'Commercial'],
    rating: 4.8,
    completedCases: 203,
    responseTime: '< 12 hours',
    experience: '12 years',
    isRecommended: true,
  },
  {
    id: '3',
    name: 'Emily Thompson',
    specializations: ['Digital Assets', 'Art', 'Creative Services'],
    rating: 4.7,
    completedCases: 89,
    responseTime: '< 8 hours',
    experience: '6 years',
    isRecommended: true,
  },
];

export function ArbiterSelection({
  onArbiterSelected,
  selectedArbiter,
  isWaitingForApproval = false,
}: ArbiterSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] =
    useState<ArbiterCandidate[]>(RECOMMENDED_ARBITERS);
  const [showRecommended, setShowRecommended] = useState(true);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setCandidates(RECOMMENDED_ARBITERS);
      setShowRecommended(true);
    } else {
      // In a real app, this would be an API call
      const filtered = RECOMMENDED_ARBITERS.filter(
        (arbiter) =>
          arbiter.name.toLowerCase().includes(query.toLowerCase()) ||
          arbiter.specializations.some((spec) =>
            spec.toLowerCase().includes(query.toLowerCase())
          )
      );
      setCandidates(filtered);
      setShowRecommended(false);
    }
  };

  const handleProposeArbiter = (arbiter: ArbiterCandidate) => {
    onArbiterSelected(arbiter.id);
  };

  if (isWaitingForApproval) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm">
                  Waiting for the other party to approve the selected arbiter...
                </span>
                <Badge variant="outline" className="w-fit text-xs">
                  Pending
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardContent>
          <div className="space-y-3">
            <Label htmlFor="arbiter-search" className="text-sm">
              Search for Arbiters
            </Label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="arbiter-search"
                placeholder="Search by name, specialization, or expertise..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-10 pl-10 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Arbiters */}
      {showRecommended && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">Recommended Arbiters</span>
              </div>
              <Badge
                variant="secondary"
                className="text-shadow-primary-foreground w-fit rounded-2xl bg-amber-100 px-3 py-1 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              >
                <Star className="mr-0.5 h-3 w-3" />
                Top Rated
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {candidates.map((candidate) => (
                <Card
                  key={candidate.id}
                  className="cursor-pointer border-l-4 border-l-amber-200 transition-all hover:shadow-md dark:border-l-amber-800"
                  onClick={() => handleProposeArbiter(candidate)}
                >
                  <CardContent className="py-0 pl-10">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={getArbiterImagePath(candidate.name)}
                              alt={candidate.name}
                            />
                            <AvatarFallback className="bg-amber-100 text-sm dark:bg-amber-900">
                              {candidate.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center gap-2.5">
                              <h4 className="text-sm font-medium">
                                {candidate.name}
                              </h4>
                              <Badge
                                variant="secondary"
                                className="rounded-2xl px-3 py-1 text-xs"
                              >
                                <Star className="mr-0.5 h-3 w-3" />
                                Recommended
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {candidate.specializations.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 items-center gap-2 px-10 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-white" />
                          <span className="font-medium">
                            {candidate.rating}
                          </span>
                          <span className="text-muted-foreground">rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">
                            {candidate.completedCases}
                          </span>
                          <span className="text-muted-foreground">cases</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {candidate.responseTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span className="font-medium">
                            {candidate.experience}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {!showRecommended && candidates.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {candidates.map((candidate) => (
                <Card
                  key={candidate.id}
                  className="cursor-pointer border-l-4 border-l-blue-200 transition-all hover:shadow-md dark:border-l-blue-800"
                  onClick={() => handleProposeArbiter(candidate)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={getArbiterImagePath(candidate.name)}
                              alt={candidate.name}
                            />
                            <AvatarFallback className="bg-blue-100 text-sm dark:bg-blue-900">
                              {candidate.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <h4 className="mb-1 text-sm font-medium">
                              {candidate.name}
                            </h4>
                            <p className="text-muted-foreground text-xs">
                              {candidate.specializations.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 items-center gap-2 px-10 text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-white" />
                          <span className="font-medium">
                            {candidate.rating}
                          </span>
                          <span className="text-muted-foreground">rating</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span className="font-medium">
                            {candidate.completedCases}
                          </span>
                          <span className="text-muted-foreground">cases</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {candidate.responseTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span className="font-medium">
                            {candidate.experience}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!showRecommended && candidates.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Search className="text-muted-foreground mx-auto h-8 w-8" />
            <p className="text-muted-foreground mt-2 text-sm">
              No arbiters found matching your search
            </p>
          </CardContent>
        </Card>
      )}

      {/* Selected Arbiter */}
      {selectedArbiter && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              Selected Arbiter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={getArbiterImagePath(selectedArbiter.name)}
                  alt={selectedArbiter.name}
                />
                <AvatarFallback className="bg-green-100 dark:bg-green-900">
                  {selectedArbiter.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="text-base font-medium">
                  {selectedArbiter.name}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {selectedArbiter.specializations.join(', ')}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:flex sm:items-center sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">
                      {selectedArbiter.rating}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{selectedArbiter.completedCases} cases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{selectedArbiter.responseTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>{selectedArbiter.experience}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
