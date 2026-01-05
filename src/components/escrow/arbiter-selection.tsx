'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  Search,
  Shield,
  Star,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Arbiter {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rating: number;
  completedDisputes: number;
  specialties: string[];
  responseTime: string;
  fee: string;
  isRecommended: boolean;
}

interface ArbiterSelectionProps {
  onArbiterSelect: (arbiter: Arbiter | null) => void;
  selectedArbiter: Arbiter | null;
  disabled?: boolean;
}

// Mock recommended arbiters
const RECOMMENDED_ARBITERS: Arbiter[] = [
  {
    id: 'arb-1',
    name: 'Maria Santos',
    email: 'maria.santos@arbitration.com',
    rating: 4.9,
    completedDisputes: 127,
    specialties: ['E-commerce', 'Digital Services', 'Freelance Work'],
    responseTime: '< 24 hours',
    fee: '₱2,500',
    isRecommended: true,
  },
  {
    id: 'arb-2',
    name: 'John Rodriguez',
    email: 'john.rodriguez@dispute-resolution.ph',
    rating: 4.8,
    completedDisputes: 89,
    specialties: ['Real Estate', 'Business Contracts', 'Employment'],
    responseTime: '< 12 hours',
    fee: '₱3,000',
    isRecommended: true,
  },
  {
    id: 'arb-3',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@tech-arbitration.com',
    rating: 4.7,
    completedDisputes: 156,
    specialties: ['Technology', 'Software Development', 'IT Services'],
    responseTime: '< 6 hours',
    fee: '₱4,000',
    isRecommended: true,
  },
];

export function ArbiterSelection({
  onArbiterSelect,
  selectedArbiter,
  disabled = false,
}: ArbiterSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArbiters, setFilteredArbiters] =
    useState<Arbiter[]>(RECOMMENDED_ARBITERS);
  const [customArbiterEmail, setCustomArbiterEmail] = useState('');

  // add stable selected id to avoid accessing .id on possibly-null value
  const selectedArbiterId: string | null = selectedArbiter
    ? selectedArbiter.id
    : null;

  // Filter arbiters based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredArbiters(RECOMMENDED_ARBITERS);
    } else {
      const filtered = RECOMMENDED_ARBITERS.filter(
        (arbiter) =>
          arbiter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          arbiter.specialties.some((specialty) =>
            specialty.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
      setFilteredArbiters(filtered);
    }
  }, [searchTerm]);

  const handleArbiterSelect = (arbiter: Arbiter) => {
    onArbiterSelect(arbiter);
  };

  const handleCustomArbiterSubmit = () => {
    if (customArbiterEmail.trim()) {
      const customArbiter: Arbiter = {
        id: `custom-${Date.now()}`,
        name: 'Custom Arbiter',
        email: customArbiterEmail,
        rating: 0,
        completedDisputes: 0,
        specialties: ['Custom Selection'],
        responseTime: 'TBD',
        fee: 'TBD',
        isRecommended: false,
      };
      onArbiterSelect(customArbiter);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
          <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Arbiter Selection</h3>
          <p className="text-muted-foreground text-sm">
            Choose a trusted third party to oversee your escrow
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search arbiters by name or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            disabled={disabled}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Arbiters</SelectItem>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="ecommerce">E-commerce</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="realestate">Real Estate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected Arbiter */}
      {selectedArbiter && (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">
                  Selected Arbiter
                </p>
                <div className="mt-1 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedArbiter.avatar} />
                      <AvatarFallback className="text-xs">
                        {selectedArbiter.name
                          .split(' ')
                          .filter((word) => !word.endsWith('.')) // Filter out titles like "Dr."
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {selectedArbiter.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {selectedArbiter.specialties[0]}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onArbiterSelect(null)}
                disabled={disabled}
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Arbiter List */}
      {!selectedArbiter && (
        <div className="space-y-3">
          {filteredArbiters.map((arbiter) => (
            <Card
              key={arbiter.id}
              className={`hover:bg-muted/50 cursor-pointer transition-colors ${
                selectedArbiterId === arbiter.id ? 'ring-2 ring-orange-500' : ''
              }`}
              onClick={() => !disabled && handleArbiterSelect(arbiter)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={arbiter.avatar} />
                      <AvatarFallback>
                        {arbiter.name
                          .split(' ')
                          .filter((word) => !word.endsWith('.')) // Filter out titles like "Dr."
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{arbiter.name}</h4>
                        {arbiter.isRecommended && (
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-[8px]"
                          >
                            <Star className="mr-0.5 h-2 w-2" />
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {arbiter.email}
                      </p>
                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{arbiter.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{arbiter.completedDisputes} disputes</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{arbiter.responseTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-orange-600">{arbiter.fee}</p>
                    <p className="text-muted-foreground text-xs">Fee</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {arbiter.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="outline"
                      className="text-xs"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Custom Arbiter Option */}
      {!selectedArbiter && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium">
                  Don&apos;t see your preferred arbiter?
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter arbiter email address..."
                  value={customArbiterEmail}
                  onChange={(e) => setCustomArbiterEmail(e.target.value)}
                  disabled={disabled}
                  className="flex-1"
                />
                <Button
                  onClick={handleCustomArbiterSubmit}
                  disabled={!customArbiterEmail.trim() || disabled}
                  size="sm"
                >
                  Add
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agreement Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Both parties must agree:</strong> The selected arbiter will be
          proposed to the other party. Both parties must approve the arbiter
          before they can oversee the escrow.
        </AlertDescription>
      </Alert>
    </div>
  );
}
