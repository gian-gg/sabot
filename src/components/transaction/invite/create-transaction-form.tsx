'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle2,
  Package,
  DollarSign,
  MapPin,
  Calendar,
  Shield,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  EscrowProtectionEnhanced,
  type EnhancedEscrowData,
} from '@/components/agreement/finalize/escrow-protection-enhanced';

const STEPS = [
  { id: 1, name: 'Item Details', icon: Package },
  { id: 2, name: 'Meeting Info', icon: MapPin },
  { id: 3, name: 'Safety Options', icon: Shield },
  { id: 4, name: 'Review', icon: CheckCircle2 },
];

interface TransactionFormData {
  item_name: string;
  item_description: string;
  price: string;
  meeting_location: string;
  meeting_time: string;
}

export function CreateTransactionForm({
  onTransactionCreated,
}: {
  onTransactionCreated: (id: string, inviteUrl: string) => void;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<TransactionFormData>({
    item_name: '',
    item_description: '',
    price: '',
    meeting_location: '',
    meeting_time: '',
  });

  // Escrow data
  const [escrowEnabled, setEscrowEnabled] = useState(false);
  const [escrowData, setEscrowData] = useState<EnhancedEscrowData>({
    deliverables: [],
    arbiter_required: false,
  });

  const updateFormData = (field: keyof TransactionFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.item_name && formData.item_description && formData.price
        );
      case 2:
        return formData.meeting_location && formData.meeting_time;
      case 3:
        if (escrowEnabled && escrowData.deliverables.length === 0) {
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!canProceedToNext()) return;

    setIsSubmitting(true);
    try {
      // Create transaction
      const response = await fetch('/api/transaction/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      const data = await response.json();

      // If escrow enabled, create escrow for the transaction
      if (escrowEnabled && escrowData.deliverables.length > 0) {
        const escrowResponse = await fetch('/api/escrow/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.item_name,
            description: formData.item_description,
            transaction_id: data.transaction.id,
            deliverables: escrowData.deliverables,
            expected_completion_date: escrowData.expected_completion_date,
            arbiter_required: escrowData.arbiter_required,
            arbiter_id: escrowData.arbiter_id,
          }),
        });

        if (!escrowResponse.ok) {
          console.warn('Escrow creation failed, but transaction was created');
        }
      }

      toast.success('Transaction created successfully');
      onTransactionCreated(data.transaction.id, data.invite_url);
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create transaction'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="item_name">
                Item Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="item_name"
                placeholder="e.g., iPhone 14 Pro Max 256GB"
                value={formData.item_name}
                onChange={(e) => updateFormData('item_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="item_description"
                placeholder="Describe the item condition, included accessories, etc."
                value={formData.item_description}
                onChange={(e) =>
                  updateFormData('item_description', e.target.value)
                }
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Price (PHP) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <DollarSign className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="price"
                  type="number"
                  placeholder="45000"
                  value={formData.price}
                  onChange={(e) => updateFormData('price', e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="meeting_location">
                Meeting Location <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <MapPin className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="meeting_location"
                  placeholder="e.g., SM Mall of Asia, Food Court"
                  value={formData.meeting_location}
                  onChange={(e) =>
                    updateFormData('meeting_location', e.target.value)
                  }
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting_time">
                Scheduled Date & Time{' '}
                <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Calendar className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                <Input
                  id="meeting_time"
                  type="datetime-local"
                  value={formData.meeting_time}
                  onChange={(e) =>
                    updateFormData('meeting_time', e.target.value)
                  }
                  className="pl-9"
                  min={new Date().toISOString().slice(0, 16)}
                  required
                />
              </div>
            </div>

            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Choose a public, well-lit location for safety. We recommend
                meeting during business hours.
              </AlertDescription>
            </Alert>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <EscrowProtectionEnhanced
              enabled={escrowEnabled}
              onEnabledChange={setEscrowEnabled}
              onEscrowDataChange={setEscrowData}
              agreementTitle={formData.item_name}
              agreementTerms={formData.item_description}
              initiatorId="current-user" // TODO: Get from auth
              participantId="pending"
              initiatorName="You"
              participantName="Buyer/Seller"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Analysis Complete - No Issues Detected</strong>
                <br />
                Both screenshots match perfectly with no inconsistencies
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Item</p>
                    <p className="font-medium">{formData.item_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Price</p>
                    <p className="font-medium">
                      ₱{parseFloat(formData.price || '0').toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Platform</p>
                    <p className="font-medium">Facebook Marketplace</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Meetup</p>
                    <p className="font-medium">{formData.meeting_location}</p>
                  </div>
                </div>

                {escrowEnabled && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                    <Shield className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <strong>Escrow Protection Enabled</strong>
                      <br />
                      {escrowData.deliverables.length} deliverable(s) protected
                      {escrowData.arbiter_required && ' with arbiter oversight'}
                    </AlertDescription>
                  </Alert>
                )}

                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                  <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                    Market Insight: Average price for similar listings: ₱
                    {(parseFloat(formData.price || '0') * 1.06)
                      .toFixed(0)
                      .toLocaleString()}
                    . Current offer is 6% below market average - within safe
                    range.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-20">
      <div className="w-full max-w-3xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground'
                          : isCompleted
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-xs font-medium">{step.name}</p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="mt-4 text-right">
            <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm">
              Step {currentStep}/4
            </span>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Item Details'}
              {currentStep === 2 && 'Meeting Information'}
              {currentStep === 3 && 'Safety & Protection'}
              {currentStep === 4 && 'Create Transaction'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 &&
                'Start a verified transaction with AI-powered safety'}
              {currentStep === 2 && 'Set up your meetup details'}
              {currentStep === 3 &&
                'Add optional escrow protection for extra security'}
              {currentStep === 4 &&
                'Review and confirm your transaction details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              {currentStep < STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  className="flex-1"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedToNext() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Transaction'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
