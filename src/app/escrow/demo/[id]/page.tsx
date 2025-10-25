'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/core/page-header';
import { BackButton } from '@/components/core/back-button';
import {
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  Bot,
  FileText,
  DollarSign,
  Package,
  User,
  Calendar,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Star,
  Users,
  CheckCircle,
  XCircle,
  Upload,
  Download,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Define a type for person data instead of using 'any'
interface PersonSummary {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  is_verified?: boolean;
  trust_score?: number;
}

interface DeliverableStatus {
  id: string;
  name: string;
  description: string;
  party: 'initiator' | 'participant';
  status:
    | 'pending'
    | 'in_progress'
    | 'completed'
    | 'verified'
    | 'confirmed'
    | 'failed';
  progress: number;
  submittedAt?: string;
  verifiedAt?: string;
  oracleType?: 'ipfs' | 'ai' | 'manual';
  confidence?: number;
  notes?: string;
}

interface EscrowDemoData {
  id: string;
  title: string;
  description: string;
  status: string;
  amount?: number;
  currency: string;
  deliverables: DeliverableStatus[];
  initiator: PersonSummary;
  participant: PersonSummary;
  arbiter?: PersonSummary;
  oracleEnabled: boolean;
  createdAt: string;
  expectedCompletion?: string;
}

export default function EscrowDemoPage() {
  const params = useParams();
  const router = useRouter();
  const escrowId = params.id as string;

  const [escrowData, setEscrowData] = useState<EscrowDemoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedDeliverables, setCompletedDeliverables] = useState<
    Set<string>
  >(new Set());

  // Demo steps
  const demoSteps = [
    {
      id: 'started',
      title: 'Escrow Started',
      description: 'All parties have joined the escrow',
      progress: 10,
    },
    {
      id: 'deliverables_submitted',
      title: 'Deliverables Submitted',
      description: 'Parties have submitted their deliverables',
      progress: 30,
    },
    {
      id: 'oracle_verification',
      title: 'Oracle Verification',
      description: 'Automatic verification is in progress',
      progress: 60,
    },
    {
      id: 'arbiter_review',
      title: 'Arbiter Review',
      description: 'Arbiter is reviewing the deliverables',
      progress: 80,
    },
    {
      id: 'completed',
      title: 'Escrow Completed',
      description: 'All deliverables verified and funds released',
      progress: 100,
    },
  ];

  useEffect(() => {
    const fetchEscrowData = async () => {
      try {
        const supabase = createClient();

        // Fetch escrow with participants
        const { data: escrow, error: escrowError } = await supabase
          .from('escrows')
          .select(
            `
            *,
            initiator:initiator_id(id, name, email, avatar_url, is_verified, trust_score),
            participant:participant_id(id, name, email, avatar_url, is_verified, trust_score),
            arbiter:arbiter_id(id, name, email, avatar_url, is_verified, trust_score)
          `
          )
          .eq('id', escrowId)
          .single();

        if (escrowError) {
          throw new Error(`Failed to fetch escrow: ${escrowError.message}`);
        }

        if (!escrow) {
          throw new Error('Escrow not found');
        }

        // Create demo data with mock deliverables
        const demoData: EscrowDemoData = {
          id: escrow.id,
          title: escrow.title || 'Escrow Transaction',
          description:
            escrow.description || 'Protected transaction with escrow',
          status: escrow.status,
          amount: escrow.amount,
          currency: escrow.currency || 'PHP',
          deliverables: [
            {
              id: 'deliverable-1',
              name: 'Primary Service',
              description: 'Complete web development service',
              party: 'initiator',
              status: 'pending',
              progress: 0,
              oracleType: 'ai',
            },
            {
              id: 'deliverable-2',
              name: 'Payment',
              description: 'Payment for services rendered',
              party: 'participant',
              status: 'pending',
              progress: 0,
              oracleType: 'manual',
            },
            {
              id: 'deliverable-3',
              name: 'Documentation',
              description: 'Project documentation and files',
              party: 'initiator',
              status: 'pending',
              progress: 0,
              oracleType: 'ipfs',
            },
          ],
          initiator: escrow.initiator,
          participant: escrow.participant,
          arbiter: escrow.arbiter,
          oracleEnabled: ['FileDeliverable', 'Service'].includes(escrow.type),
          createdAt: escrow.created_at,
          expectedCompletion: escrow.expected_completion_date,
        };

        setEscrowData(demoData);
      } catch (err) {
        console.error('Error fetching escrow:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (escrowId) {
      fetchEscrowData();
    }
  }, [escrowId]);

  // Simulate demo progression
  useEffect(() => {
    if (isDemoActive && currentStep < demoSteps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);

        // Simulate deliverable completion
        if (currentStep === 1) {
          // Mark some deliverables as completed
          const newCompleted = new Set(completedDeliverables);
          newCompleted.add('deliverable-1');
          setCompletedDeliverables(newCompleted);
        } else if (currentStep === 2) {
          const newCompleted = new Set(completedDeliverables);
          newCompleted.add('deliverable-2');
          newCompleted.add('deliverable-3');
          setCompletedDeliverables(newCompleted);
        }
      }, 4000); // 4 seconds per step

      return () => clearTimeout(timer);
    } else if (currentStep >= demoSteps.length - 1) {
      setIsDemoActive(false);
    }
  }, [isDemoActive, currentStep, demoSteps.length, completedDeliverables]);

  const handleStartDemo = () => {
    setIsDemoActive(true);
    setCurrentStep(0);
    setCompletedDeliverables(new Set());
  };

  const handlePauseDemo = () => {
    setIsDemoActive(false);
  };

  const handleResetDemo = () => {
    setCurrentStep(0);
    setIsDemoActive(false);
    setCompletedDeliverables(new Set());
  };

  const handleCompleteTransaction = () => {
    // Simulate transaction completion
    alert('Transaction completed successfully!');
    router.push('/home');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground">Loading escrow demo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !escrowData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="mb-4 text-red-500">
            <Shield className="mx-auto h-12 w-12" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Demo Not Available</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'The requested escrow demo could not be found.'}
          </p>
          <div className="flex justify-center gap-4">
            <BackButton />
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  const currentDemoStep = demoSteps[currentStep];
  const allDeliverablesCompleted = escrowData.deliverables.every((d) =>
    completedDeliverables.has(d.id)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-3xl font-bold">Escrow Protection Demo</h1>
              <p className="text-muted-foreground">
                Interactive demonstration of escrow protection features
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Demo Mode
            </Badge>
          </div>
        </div>

        {/* Demo Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Demo Controls
                </CardTitle>
                <CardDescription>
                  Control the interactive demonstration
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetDemo}
                  disabled={isDemoActive}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                {isDemoActive ? (
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

        {/* Transaction Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Transaction Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Title</span>
                  <span className="text-sm font-medium">
                    {escrowData.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Amount</span>
                  <span className="text-sm font-medium">
                    {escrowData.amount
                      ? `₱${escrowData.amount.toLocaleString()}`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant="outline">{escrowData.status}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Oracle</span>
                  <div className="flex items-center gap-1">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600">
                      {escrowData.oracleEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Arbiter</span>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">
                      {escrowData.arbiter ? 'Assigned' : 'Not Assigned'}
                    </span>
                  </div>
                </div>
                {escrowData.expectedCompletion && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Expected Completion
                    </span>
                    <span className="text-sm">
                      {new Date(
                        escrowData.expectedCompletion
                      ).toLocaleDateString()}
                    </span>
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
            <CardDescription>
              Track the progress of each deliverable in the escrow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {escrowData.deliverables.map((deliverable, index) => {
                const isCompleted = completedDeliverables.has(deliverable.id);
                const isInProgress = currentStep >= 1 && !isCompleted;

                return (
                  <Card
                    key={deliverable.id}
                    className={`transition-colors ${
                      isCompleted
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                        : isInProgress
                          ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              isCompleted
                                ? 'bg-green-100 text-green-600'
                                : isInProgress
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : isInProgress ? (
                              <Clock className="h-4 w-4" />
                            ) : (
                              <Package className="h-4 w-4" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {deliverable.name}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {deliverable.party === 'initiator'
                                  ? 'Initiator'
                                  : 'Participant'}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                              {deliverable.description}
                            </p>
                            <div className="text-muted-foreground flex items-center gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>
                                  {deliverable.party === 'initiator'
                                    ? escrowData.initiator.name
                                    : escrowData.participant.name}
                                </span>
                              </div>
                              {deliverable.oracleType && (
                                <div className="flex items-center gap-1">
                                  <Bot className="h-3 w-3" />
                                  <span className="capitalize">
                                    {deliverable.oracleType}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {isCompleted
                              ? 'Completed'
                              : isInProgress
                                ? 'In Progress'
                                : 'Pending'}
                          </div>
                          {isCompleted && deliverable.confidence && (
                            <div className="text-muted-foreground text-xs">
                              {deliverable.confidence}% confidence
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar for Individual Deliverable */}
                      <div className="mt-3">
                        <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                          <span>Progress</span>
                          <span>
                            {isCompleted ? 100 : isInProgress ? 50 : 0}%
                          </span>
                        </div>
                        <Progress
                          value={isCompleted ? 100 : isInProgress ? 50 : 0}
                          className="h-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Parties Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
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
                    <p className="font-medium">{escrowData.initiator.name}</p>
                    <p className="text-muted-foreground text-sm">Initiator</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Active</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{escrowData.participant.name}</p>
                    <p className="text-muted-foreground text-sm">Participant</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </div>

            {escrowData.arbiter && (
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium">{escrowData.arbiter.name}</p>
                    <p className="text-muted-foreground text-sm">Arbiter</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Assigned & Active</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completion Section */}
        {allDeliverablesCompleted && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                Escrow Demo Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-green-700">
                  All deliverables have been verified and completed
                  successfully. The escrow protection has worked as intended,
                  ensuring both parties are satisfied with the transaction.
                </p>

                <div className="flex gap-4">
                  <Button
                    onClick={handleCompleteTransaction}
                    className="flex-1"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete Transaction
                  </Button>
                  <Button variant="outline" onClick={handleResetDemo}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Restart Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {!allDeliverablesCompleted && currentStep < demoSteps.length - 1 && (
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
      </div>
    </div>
  );
}
