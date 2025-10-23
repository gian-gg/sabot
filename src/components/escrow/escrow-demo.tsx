'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Clock,
  Shield,
  Bot,
  FileText,
  Package,
  User,
  Calendar,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { EscrowStatusBadge } from './escrow-status-badge';
import { EscrowTimeline } from './escrow-timeline';
import { useRouter } from 'next/navigation';
import type {
  EscrowWithParticipants,
  EscrowEvent,
  EscrowStatus,
} from '@/types/escrow';

interface EscrowDemoProps {
  escrow: EscrowWithParticipants;
  onStartDemo?: () => void;
  onPauseDemo?: () => void;
  onResetDemo?: () => void;
  isDemoActive?: boolean;
  compact?: boolean; // For inline display in transaction/agreement pages
}

/**
 * EscrowDemo Component
 *
 * Interactive demo component that shows the escrow status, deliverables,
 * and progression through different states. Perfect for demonstrating
 * the escrow feature when agreements or transactions are finalized.
 *
 * Features:
 * - Real-time status display
 * - Deliverable tracking
 * - Progress visualization
 * - Interactive demo controls
 * - Timeline of events
 * - Oracle verification status
 * - Arbiter information
 */
export function EscrowDemo({
  escrow,
  onStartDemo,
  onPauseDemo,
  onResetDemo,
  compact = false,
}: EscrowDemoProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Demo steps representing different escrow states
  const demoSteps = [
    {
      id: 'created',
      title: 'Escrow Created',
      description: 'Escrow protection has been activated',
      status: 'active',
      progress: 20,
    },
    {
      id: 'participant_joined',
      title: 'Participant Joined',
      description: 'Both parties are now involved in the escrow',
      status: 'active',
      progress: 40,
    },
    {
      id: 'deliverable_submitted',
      title: 'Deliverable Submitted',
      description: 'Proof of completion has been provided',
      status: 'awaiting_confirmation',
      progress: 60,
    },
    {
      id: 'oracle_verification',
      title: 'Oracle Verification',
      description: 'Automatic verification is in progress',
      status: 'awaiting_confirmation',
      progress: 80,
    },
    {
      id: 'completed',
      title: 'Escrow Completed',
      description: 'Funds have been released successfully',
      status: 'completed',
      progress: 100,
    },
  ];

  // Simulate demo progression
  useEffect(() => {
    if (isPlaying && currentStep < demoSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 3000); // 3 seconds per step

      return () => clearTimeout(timer);
    } else if (currentStep >= demoSteps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, demoSteps.length]);

  const handleStartDemo = () => {
    setIsPlaying(true);
    onStartDemo?.();
  };

  const handlePauseDemo = () => {
    setIsPlaying(false);
    onPauseDemo?.();
  };

  const handleResetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    onResetDemo?.();
  };

  const currentDemoStep = demoSteps[currentStep];
  const isOracleApplicable = ['digital', 'service'].includes(escrow.type);

  // Extract primary deliverable info
  const primaryDeliverable = escrow.deliverables[0];
  const totalAmount = escrow.deliverables
    .filter((d) => d.value)
    .reduce((sum, d) => sum + (d.value || 0), 0);
  const currency = primaryDeliverable?.currency || 'PHP';

  // Generate demo events for timeline
  const demoEvents: EscrowEvent[] = [
    {
      id: '1',
      escrow_id: escrow.id,
      event_type: 'created',
      actor_id: escrow.initiator_id,
      details: {
        initiator: escrow.initiator.name,
      },
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      escrow_id: escrow.id,
      event_type: 'participant_joined',
      actor_id: escrow.participant_id || '',
      details: {
        participant: escrow.participant?.name,
      },
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    ...(currentStep >= 2
      ? ([
          {
            id: '3',
            escrow_id: escrow.id,
            event_type: 'status_changed' as const,
            actor_id: escrow.participant_id || '',
            details: {
              proof_type: 'document',
              proof_hash: '0x123...abc',
            },
            timestamp: new Date(Date.now() - 180000).toISOString(),
          },
        ] as EscrowEvent[])
      : []),
    ...(currentStep >= 3 && isOracleApplicable
      ? ([
          {
            id: '4',
            escrow_id: escrow.id,
            event_type: 'status_changed' as const,
            actor_id: 'oracle',
            details: {
              oracle_type: escrow.type === 'digital' ? 'ipfs' : 'ai',
              confidence_score: 95,
              verified: true,
            },
            timestamp: new Date(Date.now() - 120000).toISOString(),
          },
        ] as EscrowEvent[])
      : []),
    ...(currentStep >= 4
      ? ([
          {
            id: '5',
            escrow_id: escrow.id,
            event_type: 'completed' as const,
            actor_id: 'system',
            details: {
              final_status: 'completed',
              funds_released: true,
            },
            timestamp: new Date().toISOString(),
          },
        ] as EscrowEvent[])
      : []),
  ];

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-4 w-4" />
                Escrow Protection Demo
              </CardTitle>
              <CardDescription>
                Interactive demonstration of escrow features
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDemo}
                disabled={isPlaying}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset
              </Button>
              {isPlaying ? (
                <Button variant="outline" size="sm" onClick={handlePauseDemo}>
                  <Pause className="mr-1 h-3 w-3" />
                  Pause
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleStartDemo}
                  disabled={currentStep >= demoSteps.length - 1}
                >
                  <Play className="mr-1 h-3 w-3" />
                  {currentStep === 0 ? 'Start' : 'Resume'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{currentDemoStep.progress}%</span>
              </div>
              <Progress value={currentDemoStep.progress} className="h-2" />
              <div className="text-muted-foreground text-sm">
                {currentDemoStep.title} - Step {currentStep + 1} of{' '}
                {demoSteps.length}
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <EscrowStatusBadge
                    status={currentDemoStep.status as EscrowStatus}
                    size="sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Amount</span>
                  <span className="text-sm font-medium">
                    {totalAmount > 0
                      ? `${currency === 'PHP' ? '₱' : '$'}${totalAmount.toLocaleString()}`
                      : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Type</span>
                  <Badge variant="outline" className="text-xs">
                    {escrow.type}
                  </Badge>
                </div>
                {isOracleApplicable && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Oracle</span>
                    <div className="flex items-center gap-1">
                      <Bot className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-blue-600">Enabled</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Completion Message */}
            {currentStep >= demoSteps.length - 1 && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Demo Complete!</span>
                </div>
                <p className="mt-1 text-xs text-green-700">
                  Escrow protection demonstration finished successfully.
                </p>
              </div>
            )}

            {/* View Full Demo Button */}
            <Button
              className="w-full"
              size="sm"
              onClick={() => router.push(`/escrow/demo/${escrow.id}`)}
            >
              <Play className="mr-2 h-4 w-4" />
              View Full Interactive Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Escrow Protection Demo
              </CardTitle>
              <CardDescription>
                Interactive demonstration of escrow protection features
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDemo}
                disabled={isPlaying}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              {isPlaying ? (
                <Button variant="outline" size="sm" onClick={handlePauseDemo}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleStartDemo}
                  disabled={currentStep >= demoSteps.length - 1}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {currentStep === 0 ? 'Start Demo' : 'Resume'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{currentDemoStep.progress}%</span>
            </div>
            <Progress value={currentDemoStep.progress} className="h-2" />
            <div className="text-muted-foreground flex items-center justify-between text-sm">
              <span>{currentDemoStep.title}</span>
              <span>
                Step {currentStep + 1} of {demoSteps.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <EscrowStatusBadge
                  status={currentDemoStep.status as EscrowStatus}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-muted-foreground text-sm">
                  {currentDemoStep.progress}% Complete
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Phase</span>
                <span className="text-sm font-medium">
                  {currentDemoStep.title}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Amount</span>
                <span className="text-sm font-medium">
                  {totalAmount > 0
                    ? `${currency === 'PHP' ? '₱' : '$'}${totalAmount.toLocaleString()}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type</span>
                <Badge variant="outline">{escrow.type}</Badge>
              </div>
              {isOracleApplicable && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Oracle</span>
                  <div className="flex items-center gap-1">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600">Enabled</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliverables Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Deliverables Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Primary Deliverable</p>
                  <p className="text-muted-foreground text-sm">
                    {primaryDeliverable?.description || escrow.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentStep >= 2 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="text-muted-foreground h-5 w-5" />
                )}
                <span className="text-sm font-medium">
                  {currentStep >= 2 ? 'Submitted' : 'Pending'}
                </span>
              </div>
            </div>

            {isOracleApplicable && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Oracle Verification</p>
                    <p className="text-muted-foreground text-sm">
                      {escrow.type === 'digital'
                        ? 'IPFS file accessibility check'
                        : 'AI-powered service completion verification'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentStep >= 3 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : currentStep >= 2 ? (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Clock className="text-muted-foreground h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">
                    {currentStep >= 3
                      ? 'Verified'
                      : currentStep >= 2
                        ? 'Processing'
                        : 'Pending'}
                  </span>
                </div>
              </div>
            )}

            {escrow.arbiter_id && (
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                    <Shield className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">Arbiter Protection</p>
                    <p className="text-muted-foreground text-sm">
                      Dispute resolution available
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parties Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Parties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{escrow.initiator.name}</p>
                  <p className="text-muted-foreground text-sm">Initiator</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentStep >= 1 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="text-muted-foreground h-4 w-4" />
                )}
                <span className="text-sm">
                  {currentStep >= 1 ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            </div>

            {escrow.participant && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{escrow.participant.name}</p>
                    <p className="text-muted-foreground text-sm">Participant</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {currentStep >= 1 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="text-muted-foreground h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {currentStep >= 1 ? 'Joined' : 'Pending'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EscrowTimeline events={demoEvents} />
        </CardContent>
      </Card>

      {/* Next Steps */}
      {currentStep < demoSteps.length - 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                {currentDemoStep.description}
              </p>
              {currentStep < demoSteps.length - 1 && (
                <p className="text-sm">
                  <strong>Next:</strong> {demoSteps[currentStep + 1].title}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Message */}
      {currentStep >= demoSteps.length - 1 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle2 className="h-5 w-5" />
              Escrow Demo Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-green-700">
                You&apos;ve successfully completed the escrow protection
                demonstration. The funds have been released and both parties are
                satisfied with the transaction.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push(`/escrow/demo/${escrow.id}`)}
                  className="flex-1"
                >
                  <Play className="mr-2 h-4 w-4" />
                  View Detailed Demo
                </Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
