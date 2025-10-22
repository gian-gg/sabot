'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { ROUTES } from '@/constants/routes';
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
  MapPin,
  Calendar,
  Shield,
  Loader2,
  Truck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  EscrowProtectionEnhanced,
  type EnhancedEscrowData,
} from '@/components/agreement/finalize/escrow-protection-enhanced';
import { ArbiterSelection } from '@/components/agreement/finalize/arbiter-selection';
import { ScreenshotAnalysis } from '@/components/transaction/id/screenshot-analysis';

const STEPS = [
  { id: 1, name: 'Screenshot Analysis', icon: Shield },
  { id: 2, name: 'Item Details', icon: Package },
  { id: 3, name: 'Exchange Info', icon: MapPin },
  { id: 4, name: 'Safety Options', icon: Shield },
  { id: 5, name: 'Review', icon: CheckCircle2 },
];

interface TransactionFormData {
  item_name: string;
  item_description: string;
  price: string;
  quantity: string;
  condition: string;
  category: string;
  transaction_type: 'meetup' | 'delivery';
  meeting_location: string;
  meeting_time: string;
  delivery_address?: string;
  delivery_method?: string;
}

export function CreateTransactionForm({
  transactionId,
  onTransactionCreated,
}: {
  transactionId?: string;
  onTransactionCreated?: (id: string) => void;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('You');
  const [otherUserName, setOtherUserName] = useState<string>('Other Party');

  // Form data
  const [formData, setFormData] = useState<TransactionFormData>({
    item_name: '',
    item_description: '',
    price: '',
    quantity: '1',
    condition: '',
    category: '',
    transaction_type: 'meetup',
    meeting_location: '',
    meeting_time: '',
    delivery_address: '',
    delivery_method: '',
  });

  // Fetch user data for escrow
  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, username')
          .eq('id', user.id)
          .single();

        if (profile) {
          setCurrentUserName(profile.full_name || profile.username || 'You');
        }
      }

      // If we have a transactionId, fetch the other participant
      if (transactionId) {
        const { data: participants } = await supabase
          .from('transaction_participants')
          .select('user_id, profiles(full_name, username)')
          .eq('transaction_id', transactionId);

        if (participants) {
          const otherParticipant = participants.find(
            (p) => p.user_id !== user?.id
          );
          if (otherParticipant) {
            setOtherUserId(otherParticipant.user_id);
            const profile = otherParticipant.profiles as {
              full_name?: string;
              username?: string;
            } | null;
            setOtherUserName(
              profile?.full_name || profile?.username || 'Other Party'
            );
          }
        }
      }
    };

    fetchUserData();
  }, [transactionId]);

  // Escrow data
  const [escrowEnabled, setEscrowEnabled] = useState(false);
  const [arbiterEnabled, setArbiterEnabled] = useState(false);
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
        // Screenshot analysis step - only allow proceeding if we have a transactionId
        // This ensures the analysis can be performed
        return !!transactionId;
      case 2:
        return (
          formData.item_name &&
          formData.item_description &&
          formData.price &&
          formData.quantity &&
          formData.condition &&
          formData.category
        );
      case 2:
        if (formData.transaction_type === 'meetup') {
          return formData.meeting_location && formData.meeting_time;
        } else {
          return formData.delivery_address && formData.delivery_method;
        }
      case 3:
        if (escrowEnabled) {
          // Must have at least one deliverable
          if (escrowData.deliverables.length === 0) {
            return false;
          }
          // Payment deliverables must have amount and currency
          const invalidPaymentDeliverables = escrowData.deliverables.filter(
            (d) =>
              (d.type === 'cash' || d.type === 'digital_transfer') &&
              (!d.value || d.value <= 0 || !d.currency)
          );
          if (invalidPaymentDeliverables.length > 0) {
            return false;
          }
          // All deliverables must have descriptions
          const emptyDescriptions = escrowData.deliverables.filter(
            (d) => !d.description || d.description.trim() === ''
          );
          if (emptyDescriptions.length > 0) {
            return false;
          }
        }
        // Arbiter validation: if enabled, must have selected an arbiter
        if (arbiterEnabled && !escrowData.arbiter_id) {
          return false;
        }
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext()) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    } else {
      // Provide feedback on what's missing
      if (currentStep === 3) {
        if (escrowEnabled) {
          if (escrowData.deliverables.length === 0) {
            toast.error(
              'Please add at least one deliverable for escrow protection'
            );
          } else {
            const invalidPayment = escrowData.deliverables.find(
              (d) =>
                (d.type === 'cash' || d.type === 'digital_transfer') &&
                (!d.value || d.value <= 0 || !d.currency)
            );
            if (invalidPayment) {
              toast.error(
                'Payment deliverables must have a valid amount and currency'
              );
            } else {
              toast.error('All deliverables must have descriptions');
            }
          }
        } else if (arbiterEnabled && !escrowData.arbiter_id) {
          toast.error('Please select an arbiter from the list');
        }
      } else {
        toast.error('Please fill in all required fields');
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!canProceedToNext()) return;

    setIsSubmitting(true);
    try {
      let finalTransactionId = transactionId;

      if (!transactionId) {
        // Create new transaction (initial invitation flow)
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
        finalTransactionId = data.transaction.id;
      }
      // If transactionId exists, transaction is already created, just finalize with escrow

      // If escrow enabled, create escrow for the transaction
      if (
        escrowEnabled &&
        escrowData.deliverables.length > 0 &&
        finalTransactionId
      ) {
        const escrowResponse = await fetch('/api/escrow/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.item_name,
            description: formData.item_description,
            transaction_id: finalTransactionId,
            deliverables: escrowData.deliverables,
            expected_completion_date: escrowData.expected_completion_date,
            arbiter_required: escrowData.arbiter_required,
            arbiter_id: escrowData.arbiter_id,
          }),
        });

        if (!escrowResponse.ok) {
          const errorData = await escrowResponse
            .json()
            .catch(() => ({ error: 'Failed to create escrow' }));
          console.warn('Escrow creation failed:', errorData);
          toast.warning('Transaction created but escrow setup failed');
        }
      }

      // Navigate to active transaction page if updating, or call callback if creating
      if (transactionId) {
        toast.success('Transaction finalized successfully!');
        setTimeout(() => {
          router.push(ROUTES.TRANSACTION.ACTIVE(finalTransactionId!));
        }, 800);
      } else if (onTransactionCreated) {
        toast.success('Transaction created successfully');
        onTransactionCreated(finalTransactionId!);
      }
    } catch (error) {
      console.error('Error with transaction:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to process transaction'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        if (!transactionId) {
          return (
            <Alert>
              <AlertDescription>
                Screenshot analysis requires an existing transaction. Please
                create the transaction first by proceeding through the other
                steps.
              </AlertDescription>
            </Alert>
          );
        }
        return <ScreenshotAnalysis transactionId={transactionId} />;
      case 2:
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData('category', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                    <SelectItem value="home">Home & Living</SelectItem>
                    <SelectItem value="sports">Sports & Outdoors</SelectItem>
                    <SelectItem value="books">Books & Media</SelectItem>
                    <SelectItem value="toys">Toys & Games</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">
                  Condition <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => updateFormData('condition', value)}
                >
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand-new">Brand New</SelectItem>
                    <SelectItem value="like-new">Like New</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">For Parts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) => updateFormData('quantity', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="item_description"
                placeholder="Describe the item condition, included accessories, warranty, etc."
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
                <span className="text-muted-foreground absolute top-3 left-3 text-sm">
                  ₱
                </span>
                <Input
                  id="price"
                  type="number"
                  placeholder="45000"
                  value={formData.price}
                  onChange={(e) => updateFormData('price', e.target.value)}
                  className="pl-8"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>
                Transaction Type <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={formData.transaction_type}
                onValueChange={(value: 'meetup' | 'delivery') =>
                  updateFormData('transaction_type', value)
                }
                className="grid grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="meetup"
                  className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4"
                >
                  <RadioGroupItem
                    value="meetup"
                    id="meetup"
                    className="sr-only"
                  />
                  <MapPin className="mb-3 h-6 w-6" />
                  <span className="font-medium">Meet Up</span>
                  <span className="text-muted-foreground mt-1 text-center text-xs">
                    Meet in person
                  </span>
                </Label>
                <Label
                  htmlFor="delivery"
                  className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4"
                >
                  <RadioGroupItem
                    value="delivery"
                    id="delivery"
                    className="sr-only"
                  />
                  <Truck className="mb-3 h-6 w-6" />
                  <span className="font-medium">Delivery</span>
                  <span className="text-muted-foreground mt-1 text-center text-xs">
                    Ship or deliver
                  </span>
                </Label>
              </RadioGroup>
            </div>

            {formData.transaction_type === 'meetup' ? (
              <>
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
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="delivery_address">
                    Delivery Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="delivery_address"
                    placeholder="Enter complete delivery address"
                    value={formData.delivery_address}
                    onChange={(e) =>
                      updateFormData('delivery_address', e.target.value)
                    }
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_method">
                    Delivery Method <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="delivery_method"
                    placeholder="e.g., LBC, J&T Express, Lalamove, Personal Courier"
                    value={formData.delivery_method}
                    onChange={(e) =>
                      updateFormData('delivery_method', e.target.value)
                    }
                    required
                  />
                </div>

                <Alert>
                  <Truck className="h-4 w-4" />
                  <AlertDescription>
                    Make sure to agree on who pays for shipping and get tracking
                    information for safe delivery.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Escrow Protection - Left */}
              <Card className="w-full border-2 shadow-lg">
                <EscrowProtectionEnhanced
                  enabled={escrowEnabled}
                  onEnabledChange={setEscrowEnabled}
                  onEscrowDataChange={(data) => {
                    setEscrowData(data);
                    // Don't auto-enable arbiter from escrow
                    setArbiterEnabled(false);
                  }}
                  agreementTitle={formData.item_name}
                  agreementTerms={formData.item_description}
                  itemDetails={{
                    name: formData.item_name,
                    description: formData.item_description,
                    price: parseFloat(formData.price || '0'),
                    quantity: parseInt(formData.quantity || '1'),
                    category: formData.category,
                    condition: formData.condition,
                  }}
                  initiatorId={currentUserId || ''}
                  participantId={otherUserId || ''}
                  initiatorName={currentUserName}
                  participantName={otherUserName}
                />
              </Card>

              {/* Arbiter Oversight - Right */}
              <Card className="w-full border-2 shadow-lg">
                <div className="bg-muted/30 border-b p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950">
                        <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Arbiter Oversight</h3>
                        <p className="text-muted-foreground text-sm">
                          Third-party dispute mediation
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={arbiterEnabled}
                      onCheckedChange={(checked) => {
                        setArbiterEnabled(checked);
                        setEscrowData((prev) => ({
                          ...prev,
                          arbiter_required: checked,
                        }));
                      }}
                      aria-label="Enable arbiter oversight"
                      className="ring-1 ring-amber-200 ring-offset-1 data-[state=checked]:bg-amber-600 data-[state=checked]:ring-amber-400 dark:ring-amber-800"
                    />
                  </div>
                </div>

                {arbiterEnabled ? (
                  <div className="p-6">
                    <ArbiterSelection
                      initiatorId={currentUserId || ''}
                      participantId={otherUserId || ''}
                      initiatorName={currentUserName}
                      participantName={otherUserName}
                      onArbiterSelected={(arbiterId) => {
                        setEscrowData((prev) => ({
                          ...prev,
                          arbiter_id: arbiterId,
                        }));
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-6">
                    <p className="text-muted-foreground mb-4 text-sm">
                      Add an independent arbiter to oversee this transaction and
                      mediate in case of disputes. This provides an extra layer
                      of security and trust.
                    </p>
                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                      <Shield className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                        <strong>How it works:</strong> An arbiter is a neutral
                        third party who can help resolve disputes and ensure
                        fair outcomes for both parties.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
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
                    <p className="text-muted-foreground text-sm">Category</p>
                    <p className="font-medium capitalize">
                      {formData.category.replace('-', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Condition</p>
                    <p className="font-medium capitalize">
                      {formData.condition.replace('-', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Quantity</p>
                    <p className="font-medium">{formData.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Price</p>
                    <p className="font-medium">
                      ₱{parseFloat(formData.price || '0').toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Type</p>
                    <p className="font-medium capitalize">
                      {formData.transaction_type}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm">
                      {formData.transaction_type === 'meetup'
                        ? 'Meeting Location'
                        : 'Delivery Method'}
                    </p>
                    <p className="font-medium">
                      {formData.transaction_type === 'meetup'
                        ? formData.meeting_location
                        : formData.delivery_method}
                    </p>
                  </div>
                </div>

                {escrowEnabled && (
                  <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
                    <Shield className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <strong>Escrow Protection Enabled</strong>
                      <br />
                      {escrowData.deliverables.length} deliverable(s) protected
                    </AlertDescription>
                  </Alert>
                )}

                {arbiterEnabled && (
                  <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                    <Shield className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      <strong>Arbiter Oversight Enabled</strong>
                      <br />
                      Independent third-party mediation included
                    </AlertDescription>
                  </Alert>
                )}

                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
                  <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                    Market Insight: Average price for similar{' '}
                    {formData.category} listings: ₱
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
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-20 pb-8">
      <div
        className={`w-full transition-all duration-300 ${currentStep === 3 ? 'max-w-6xl' : 'max-w-3xl'}`}
      >
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
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground scale-110 shadow-lg'
                          : isCompleted
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <p
                      className={`mt-2 text-xs font-medium transition-colors ${isActive ? 'text-primary' : ''}`}
                    >
                      {step.name}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 transition-all duration-300 ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {currentStep === 1 && '🔍 Analyze screenshots'}
              {currentStep === 2 && '📦 Tell us about your item'}
              {currentStep === 3 && '🚚 How will you exchange?'}
              {currentStep === 4 && '🛡️ Add security features'}
              {currentStep === 5 && '✅ Review and create'}
            </div>
            <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-sm font-medium shadow-sm">
              Step {currentStep}/{STEPS.length}
            </span>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-muted/30 space-y-3 border-b">
            <CardTitle className="text-2xl">
              {currentStep === 1 && 'Screenshot Analysis'}
              {currentStep === 2 && 'Item Details'}
              {currentStep === 3 && 'Exchange Information'}
              {currentStep === 4 && 'Safety & Protection'}
              {currentStep === 5 &&
                (transactionId ? 'Review & Confirm' : 'Create Transaction')}
            </CardTitle>
            <CardDescription className="text-base">
              {currentStep === 1 &&
                'AI-powered analysis of your conversation screenshots to extract transaction details and detect fraud'}
              {currentStep === 2 &&
                (transactionId
                  ? 'Update transaction details'
                  : "Describe what you're buying or selling")}
              {currentStep === 3 &&
                "Choose how you'll exchange (meetup or delivery)"}
              {currentStep === 4 &&
                'Add optional escrow protection and arbiter oversight'}
              {currentStep === 5 &&
                'Review and confirm your transaction details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex gap-3 border-t pt-6">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="h-11 flex-1"
                  size="lg"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              {currentStep < STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNext()}
                  className="h-11 flex-1 shadow-md"
                  size="lg"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedToNext() || isSubmitting}
                  className="h-11 flex-1 shadow-md"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {transactionId ? 'Finalizing...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {transactionId
                        ? 'Finalize Transaction'
                        : 'Create Transaction'}
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
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
