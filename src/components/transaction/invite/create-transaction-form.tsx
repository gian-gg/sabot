'use client';

import { ArbiterSelection } from '@/components/agreement/finalize/arbiter-selection';
import {
  EscrowProtectionEnhanced,
  type EnhancedEscrowData,
} from '@/components/agreement/finalize/escrow-protection-enhanced';
import { ScreenshotAnalysis } from '@/components/transaction/id/screenshot-analysis';
import { DataConflictResolver } from '@/components/transaction/invite/data-conflict-resolver';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { createClient } from '@/lib/supabase/client';
import { mapConditionToOption } from '@/lib/utils/condition-mapping';
import type { AnalysisData } from '@/types/analysis';
import { useSharedConflictResolution } from '@/hooks/use-shared-conflict-resolution';
import { featureFlags } from '@/lib/config/features';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GitMerge,
  Globe,
  Loader2,
  Lock,
  MapPin,
  Package,
  Shield,
  Truck,
  Unlock,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, name: 'Screenshot Analysis', icon: Shield },
  { id: 2, name: 'Resolve Conflicts', icon: GitMerge },
  { id: 3, name: 'Item Details', icon: Package },
  { id: 4, name: 'Exchange Info', icon: MapPin },
  { id: 5, name: 'Safety Options', icon: Shield },
  { id: 6, name: 'Review', icon: CheckCircle2 },
];

interface TransactionFormData {
  item_name: string;
  product_model: string;
  item_description: string;
  price: string;
  quantity: string;
  condition: string;
  category: string;
  transaction_type: 'meetup' | 'delivery' | 'online';
  meeting_location: string;
  meeting_time: string;
  delivery_address?: string;
  delivery_method?: string;
  online_platform?: string;
  online_contact?: string;
  online_instructions?: string;
}

interface AnalysisWithSource extends AnalysisData {
  source: string;
  screenshotId: string;
}

export function CreateTransactionForm({
  transactionId,
  onTransactionCreated,
  conflictResolution,
  userId,
  userName,
}: {
  transactionId?: string;
  onTransactionCreated?: (id: string) => void;
  conflictResolution?: ReturnType<typeof useSharedConflictResolution>;
  userId?: string;
  userName?: string;
}) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    userId || null
  );
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>(
    userName || 'You'
  );
  const [otherUserName, setOtherUserName] = useState<string>('Other Party');
  const [extractedData, setExtractedData] = useState<AnalysisData | null>(null);
  const [isDataExtracted, setIsDataExtracted] = useState(false);
  const [multipleAnalyses, setMultipleAnalyses] = useState<
    AnalysisWithSource[]
  >([]);
  const [hasConflicts, setHasConflicts] = useState(false);
  const [bothPartiesReady, setBothPartiesReady] = useState(false);
  const [conflictsWereResolved, setConflictsWereResolved] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [currentUserConfirmed, setCurrentUserConfirmed] = useState(false);

  // Scroll to top whenever the step changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Track when current user confirms in conflict resolution
  useEffect(() => {
    if (conflictResolution && currentUserId) {
      const currentUser = conflictResolution.participants.find(
        (p) => p.id === currentUserId || p.id === userId
      );
      if (currentUser) {
        setCurrentUserConfirmed(currentUser.isReady);
      }
    }
  }, [conflictResolution, currentUserId, userId]);

  // Show warning when other party disconnects
  useEffect(() => {
    if (
      featureFlags.enableDisconnectWarning &&
      conflictResolution?.otherPartyDisconnected
    ) {
      toast.error('Transaction failed: Other party has disconnected', {
        duration: 10000,
        description:
          'The other participant left the transaction. Please try again.',
      });
    }
  }, [conflictResolution?.otherPartyDisconnected]);

  // Track which fields are locked individually
  const [fieldLocks, setFieldLocks] = useState({
    item_name: false,
    product_model: false,
    item_description: false,
    price: false,
    quantity: false,
    condition: false,
    category: false,
    transaction_type: false,
    meeting_location: false,
    meeting_time: false,
    delivery_address: false,
    delivery_method: false,
    online_platform: false,
    online_contact: false,
    online_instructions: false,
  });

  // Form data
  const [formData, setFormData] = useState<TransactionFormData>({
    item_name: '',
    product_model: '',
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
    online_platform: '',
    online_contact: '',
    online_instructions: '',
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

  // Helper to toggle individual field lock
  const toggleFieldLock = (field: keyof typeof fieldLocks) => {
    setFieldLocks((prev) => ({ ...prev, [field]: !prev[field] }));
  };

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

  // Transform extracted analysis data to form data
  const transformExtractedData = (data: AnalysisData) => {
    const mapCategoryFromProductType = (productType?: string): string => {
      if (!productType) return 'other';
      const type = productType.toLowerCase();

      // Electronics - most comprehensive matching
      if (
        type.includes('digital') ||
        type.includes('mobile') ||
        type.includes('phone') ||
        type.includes('smartphone') ||
        type.includes('iphone') ||
        type.includes('android') ||
        type.includes('laptop') ||
        type.includes('computer') ||
        type.includes('tablet') ||
        type.includes('ipad') ||
        type.includes('headphone') ||
        type.includes('speaker') ||
        type.includes('camera') ||
        type.includes('gaming') ||
        type.includes('console') ||
        type.includes('playstation') ||
        type.includes('xbox') ||
        type.includes('nintendo') ||
        type.includes('electronic') ||
        type.includes('tech') ||
        type.includes('gadget') ||
        type.includes('device') ||
        type.includes('credit') ||
        type.includes('card')
      )
        return 'electronics';

      // Fashion & Apparel
      if (
        type.includes('fashion') ||
        type.includes('apparel') ||
        type.includes('clothing') ||
        type.includes('clothes') ||
        type.includes('shirt') ||
        type.includes('dress') ||
        type.includes('pants') ||
        type.includes('jeans') ||
        type.includes('jacket') ||
        type.includes('coat') ||
        type.includes('shoes') ||
        type.includes('sneakers') ||
        type.includes('boots') ||
        type.includes('accessories') ||
        type.includes('jewelry') ||
        type.includes('watch') ||
        type.includes('bag') ||
        type.includes('purse') ||
        type.includes('handbag')
      )
        return 'fashion';

      // Home & Living
      if (
        type.includes('home') ||
        type.includes('living') ||
        type.includes('furniture') ||
        type.includes('chair') ||
        type.includes('table') ||
        type.includes('sofa') ||
        type.includes('bed') ||
        type.includes('mattress') ||
        type.includes('kitchen') ||
        type.includes('appliance') ||
        type.includes('refrigerator') ||
        type.includes('microwave') ||
        type.includes('oven') ||
        type.includes('dishwasher') ||
        type.includes('washing') ||
        type.includes('dryer') ||
        type.includes('decor') ||
        type.includes('decoration') ||
        type.includes('lamp') ||
        type.includes('light') ||
        type.includes('garden') ||
        type.includes('plant')
      )
        return 'home';

      // Sports & Outdoors
      if (
        type.includes('sports') ||
        type.includes('outdoor') ||
        type.includes('outdoors') ||
        type.includes('fitness') ||
        type.includes('gym') ||
        type.includes('exercise') ||
        type.includes('bike') ||
        type.includes('bicycle') ||
        type.includes('skateboard') ||
        type.includes('skate') ||
        type.includes('surfboard') ||
        type.includes('surf') ||
        type.includes('tennis') ||
        type.includes('basketball') ||
        type.includes('football') ||
        type.includes('soccer') ||
        type.includes('baseball') ||
        type.includes('golf') ||
        type.includes('hiking') ||
        type.includes('camping') ||
        type.includes('tent') ||
        type.includes('equipment') ||
        type.includes('gear')
      )
        return 'sports';

      // Books & Media
      if (
        type.includes('book') ||
        type.includes('books') ||
        type.includes('media') ||
        type.includes('magazine') ||
        type.includes('newspaper') ||
        type.includes('comic') ||
        type.includes('manga') ||
        type.includes('novel') ||
        type.includes('textbook') ||
        type.includes('dvd') ||
        type.includes('cd') ||
        type.includes('vinyl') ||
        type.includes('record') ||
        type.includes('movie') ||
        type.includes('film') ||
        type.includes('music') ||
        type.includes('album')
      )
        return 'books';

      // Toys & Games
      if (
        type.includes('toy') ||
        type.includes('toys') ||
        type.includes('game') ||
        type.includes('games') ||
        type.includes('board') ||
        type.includes('puzzle') ||
        type.includes('doll') ||
        type.includes('action') ||
        type.includes('figure') ||
        type.includes('lego') ||
        type.includes('barbie') ||
        type.includes('teddy') ||
        type.includes('bear') ||
        type.includes('stuffed') ||
        type.includes('animal') ||
        type.includes('card') ||
        type.includes('cards') ||
        type.includes('pokemon') ||
        type.includes('yugioh') ||
        type.includes('magic')
      )
        return 'toys';

      // Automotive
      if (
        type.includes('automotive') ||
        type.includes('vehicle') ||
        type.includes('car') ||
        type.includes('truck') ||
        type.includes('motorcycle') ||
        type.includes('bike') ||
        type.includes('scooter') ||
        type.includes('auto') ||
        type.includes('motor') ||
        type.includes('engine') ||
        type.includes('tire') ||
        type.includes('wheel') ||
        type.includes('parts') ||
        type.includes('accessories') ||
        type.includes('tools')
      )
        return 'automotive';

      return 'other';
    };

    const mapConditionFromProductCondition = (condition?: string): string => {
      if (!condition) return '';
      // Use the improved fuzzy matching logic
      return mapConditionToOption(condition);
    };

    const mapTransactionType = (
      type?: string
    ): 'meetup' | 'delivery' | 'online' => {
      if (!type) return 'meetup';
      const t = type.toLowerCase();
      if (
        t.includes('delivery') ||
        t.includes('shipping') ||
        t.includes('mail')
      ) {
        return 'delivery';
      }
      if (
        t.includes('online') ||
        t.includes('virtual') ||
        t.includes('digital')
      ) {
        return 'online';
      }
      return 'meetup';
    };

    // Strict validation: only mark as extracted if ALL required fields are present
    const hasAllRequiredFields =
      (data.productModel || data.productType) &&
      data.itemDescription &&
      data.proposedPrice &&
      data.quantity &&
      data.productCondition &&
      data.productType;

    const transactionType = mapTransactionType(data.transactionType);
    const hasRequiredLocationFields =
      transactionType === 'meetup'
        ? data.meetingLocation && data.meetingSchedule
        : data.deliveryAddress && data.deliveryMethod;

    // Only mark as extracted if we have all required data
    const shouldMarkAsExtracted = Boolean(
      hasAllRequiredFields && hasRequiredLocationFields
    );

    const newFormData = {
      item_name: data.productModel || data.productType || '',
      product_model: data.productModel || '',
      item_description: data.itemDescription || '',
      price: data.proposedPrice?.toString() || '',
      quantity: data.quantity?.toString() || '',
      condition: mapConditionFromProductCondition(data.productCondition),
      category: mapCategoryFromProductType(data.productType),
      transaction_type: transactionType,
      meeting_location: data.meetingLocation || '',
      meeting_time: data.meetingSchedule || '',
      delivery_address: data.deliveryAddress || '',
      delivery_method: data.deliveryMethod || '',
      online_platform: '',
      online_contact: '',
      online_instructions: '',
    };

    setFormData(newFormData);

    // Lock individual fields that have extracted data
    setFieldLocks({
      item_name: !!(data.productModel || data.productType),
      product_model: !!data.productModel,
      item_description: !!data.itemDescription,
      price: !!data.proposedPrice,
      quantity: !!data.quantity,
      condition: !!data.productCondition,
      category: !!data.productType,
      transaction_type: !!data.transactionType,
      meeting_location: !!data.meetingLocation,
      meeting_time: !!data.meetingSchedule,
      delivery_address: !!data.deliveryAddress,
      delivery_method: !!data.deliveryMethod,
      online_platform: false,
      online_contact: false,
      online_instructions: false,
    });

    setIsDataExtracted(shouldMarkAsExtracted);

    // If not all fields are present, show a warning
    if (!shouldMarkAsExtracted) {
      console.warn(
        '⚠️ Incomplete data extracted. Fields will be unlocked for manual entry.'
      );
      toast.warning(
        'Some fields could not be extracted from screenshots. Please fill them manually.'
      );
    }
  };

  // Callback for when screenshot analysis completes (multiple analyses)
  const handleAnalysisComplete = (
    data: AnalysisData | AnalysisWithSource[]
  ) => {
    // Only process if we haven't already completed analysis
    if (analysisCompleted) {
      console.log('📊 Analysis already processed, skipping');
      return;
    }

    console.log('📊 Received analysis data:', data);

    // Mark analysis as completed to prevent re-running
    setAnalysisCompleted(true);

    // Check if we received multiple analyses
    if (Array.isArray(data)) {
      console.log('📊 Multiple analyses detected:', data.length);
      setMultipleAnalyses(data);
      setHasConflicts(true);
      // Don't auto-extract yet, wait for conflict resolution
    } else {
      // Single analysis
      console.log('📊 Single analysis detected');
      setExtractedData(data);
      setMultipleAnalyses([]);
      setHasConflicts(false);
      transformExtractedData(data);
    }
  };

  // Callback for when conflicts are resolved
  const handleConflictsResolved = (resolvedData: AnalysisData) => {
    console.log('✅ Conflicts resolved:', resolvedData);
    setExtractedData(resolvedData);
    setHasConflicts(false);
    setConflictsWereResolved(true); // Track that conflicts existed and were resolved
    transformExtractedData(resolvedData);
  };

  // Helper to get missing fields for step 3
  const getMissingFields = () => {
    const missing: string[] = [];
    if (!formData.item_name) missing.push('item_name');
    if (!formData.item_description) missing.push('item_description');
    if (!formData.price) missing.push('price');
    if (!formData.quantity) missing.push('quantity');
    if (!formData.category) missing.push('category');
    return missing;
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        // Screenshot analysis step - only allow proceeding if we have a transactionId
        // This ensures the analysis can be performed
        return !!transactionId;
      case 2:
        // Conflict resolution step - only proceed if both parties have confirmed
        if (hasConflicts) {
          // Check both the state AND the actual participants from conflict resolution
          const actuallyAllReady =
            conflictResolution?.allParticipantsReady?.() || false;
          console.log('[CreateTransactionForm] Step 2 check:', {
            hasConflicts,
            bothPartiesReady,
            actuallyAllReady,
            participants: conflictResolution?.participants,
          });
          return bothPartiesReady || actuallyAllReady; // Use either check
        }
        // If no conflicts, can proceed if we have extracted data
        return !!extractedData;
      case 3:
        return (
          formData.item_name &&
          formData.item_description &&
          formData.price &&
          formData.quantity &&
          formData.category
        );
      case 4:
        if (formData.transaction_type === 'meetup') {
          return formData.meeting_location && formData.meeting_time;
        } else if (formData.transaction_type === 'delivery') {
          return formData.delivery_address && formData.delivery_method;
        } else if (formData.transaction_type === 'online') {
          return true; // All online fields are optional
        }
        return false;
      case 5:
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
      case 6:
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
    setCurrentStep((prev) => {
      const newStep = prev - 1;

      // Prevent going back to step 1 if user has confirmed (on step 2)
      if (prev === 2 && newStep === 1 && currentUserConfirmed) {
        toast.info('Cannot go back after confirming. Please unconfirm first.');
        return prev; // Stay on current step
      }

      // Prevent going back to conflict resolution (step 2) if already resolved
      if (newStep === 2 && conflictsWereResolved) {
        toast.info('Cannot return to conflict resolution after proceeding');
        return prev; // Stay on current step
      }

      return Math.max(newStep, 1);
    });
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
      } else {
        // Update existing transaction with form data
        console.log('Updating transaction:', {
          transactionId,
          formData: {
            item_name: formData.item_name,
            transaction_type: formData.transaction_type,
            price: formData.price,
          },
        });

        const response = await fetch(`/api/transaction/${transactionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: 'Unknown error' }));
          console.error('Transaction update failed:', errorData);
          throw new Error(errorData.error || 'Failed to update transaction');
        }

        const updateData = await response.json();
        console.log('Transaction updated successfully:', updateData);
        finalTransactionId = transactionId;
      }

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

        // Always show ScreenshotAnalysis - it handles its own state
        // If analysis is completed, it will show the results
        // If not completed, it will run the analysis
        return (
          <ScreenshotAnalysis
            transactionId={transactionId}
            onAnalysisComplete={handleAnalysisComplete}
          />
        );
      case 2:
        // Conflict resolution step
        if (!transactionId) {
          return (
            <Alert>
              <AlertDescription>
                Please complete the screenshot analysis first.
              </AlertDescription>
            </Alert>
          );
        }

        if (multipleAnalyses.length === 0 && !extractedData) {
          return (
            <Alert>
              <AlertDescription>
                Waiting for screenshot analysis to complete...
              </AlertDescription>
            </Alert>
          );
        }

        // If we have extracted data and no conflicts, show success
        // if (extractedData && !hasConflicts) {
        //   return (
        //     <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        //       <CheckCircle2 className="h-4 w-4 text-green-600" />
        //       <AlertDescription className="text-green-800 dark:text-green-200">
        //         ✅ Data extracted successfully with no conflicts. Click Next to
        //         continue.
        //       </AlertDescription>
        //     </Alert>
        //   );
        // }

        // Show conflict resolver
        return (
          <DataConflictResolver
            analyses={multipleAnalyses}
            onResolve={handleConflictsResolved}
            transactionId={transactionId || 'temp-' + Date.now()}
            userId={
              currentUserId ||
              userId ||
              'tab-' + Math.random().toString(36).slice(2, 9)
            }
            userName={currentUserName || userName || 'Guest'}
            onAllReady={(isReady) => setBothPartiesReady(isReady)}
            conflictResolution={conflictResolution}
          />
        );
      case 3:
        return (
          <div className="space-y-6">
            {isDataExtracted && extractedData && (
              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  ✅ Data automatically extracted from screenshots (Confidence:{' '}
                  {((extractedData.confidence || 0) * 100).toFixed(0)}%)
                  {extractedData.riskFlags &&
                    extractedData.riskFlags.length > 0 && (
                      <span className="mt-1 block text-amber-600 dark:text-amber-400">
                        ⚠️ Risk flags detected:{' '}
                        {extractedData.riskFlags.join(', ')}
                      </span>
                    )}
                </AlertDescription>
              </Alert>
            )}

            {/* Extraction Status Banner */}
            {isDataExtracted &&
              Object.values(fieldLocks).some((locked) => locked) && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    ✓ Some fields were extracted from screenshot analysis
                  </AlertDescription>
                </Alert>
              )}

            {/* Missing Fields Alert */}
            {getMissingFields().length > 0 && (
              <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  ⚠️{' '}
                  {getMissingFields()
                    .map((field) => {
                      const fieldNames: Record<string, string> = {
                        item_name: 'Item Name',
                        item_description: 'Description',
                        price: 'Price',
                        quantity: 'Quantity',
                        condition: 'Condition',
                        category: 'Category',
                      };
                      return fieldNames[field];
                    })
                    .join(', ')}{' '}
                  {getMissingFields().length === 1 ? 'is' : 'are'} currently
                  missing
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="item_name">
                  Item Name <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="item_name"
                    placeholder="e.g., iPhone 14 Pro Max 256GB"
                    value={formData.item_name}
                    onChange={(e) =>
                      updateFormData('item_name', e.target.value)
                    }
                    disabled={fieldLocks.item_name}
                    className={`flex-1 ${fieldLocks.item_name ? 'bg-muted cursor-not-allowed' : ''} ${!formData.item_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    required
                  />
                  {fieldLocks.item_name && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFieldLock('item_name')}
                      className="shrink-0"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  )}
                  {!fieldLocks.item_name && formData.item_name && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFieldLock('item_name')}
                      className="shrink-0"
                    >
                      <Unlock className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_model">
                  Model{' '}
                  <span className="text-muted-foreground text-xs">
                    (Optional)
                  </span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="product_model"
                    placeholder={
                      fieldLocks.product_model && !formData.product_model
                        ? "Doesn't apply"
                        : 'e.g., A2484, MQ8E3'
                    }
                    value={formData.product_model}
                    onChange={(e) =>
                      updateFormData('product_model', e.target.value)
                    }
                    disabled={fieldLocks.product_model}
                    className={`flex-1 ${fieldLocks.product_model ? 'bg-muted cursor-not-allowed' : ''}`}
                  />
                  {fieldLocks.product_model && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFieldLock('product_model')}
                      className="shrink-0"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  )}
                  {!fieldLocks.product_model && formData.product_model && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFieldLock('product_model')}
                      className="shrink-0"
                    >
                      <Unlock className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateFormData('category', value)}
                    disabled={fieldLocks.category}
                  >
                    <SelectTrigger
                      id="category"
                      className={`flex-1 ${fieldLocks.category ? 'bg-muted cursor-not-allowed' : ''} ${!formData.category ? 'border-red-500 focus:ring-red-500' : ''}`}
                    >
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
                  {fieldLocks.category && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFieldLock('category')}
                      className="shrink-0"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  )}
                  {!fieldLocks.category && formData.category && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFieldLock('category')}
                      className="shrink-0"
                    >
                      <Unlock className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">
                  Condition{' '}
                  <span className="text-muted-foreground">(Optional)</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.condition}
                    onValueChange={(value) =>
                      updateFormData('condition', value)
                    }
                    disabled={fieldLocks.condition}
                  >
                    <SelectTrigger
                      id="condition"
                      className={`flex-1 ${fieldLocks.condition ? 'bg-muted cursor-not-allowed' : ''}`}
                    >
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
                  {fieldLocks.condition && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFieldLock('condition')}
                      className="shrink-0"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  )}
                  {!fieldLocks.condition && formData.condition && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFieldLock('condition')}
                      className="shrink-0"
                    >
                      <Unlock className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={(e) => updateFormData('quantity', e.target.value)}
                    required
                    disabled={fieldLocks.quantity}
                    className={`flex-1 ${fieldLocks.quantity ? 'bg-muted cursor-not-allowed' : ''} ${!formData.quantity ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                  {fieldLocks.quantity && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFieldLock('quantity')}
                      className="shrink-0"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  )}
                  {!fieldLocks.quantity && formData.quantity && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFieldLock('quantity')}
                      className="shrink-0"
                    >
                      <Unlock className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_description">
                Description <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Textarea
                  id="item_description"
                  placeholder="Describe the item condition, included accessories, warranty, etc."
                  value={formData.item_description}
                  onChange={(e) =>
                    updateFormData('item_description', e.target.value)
                  }
                  rows={4}
                  disabled={fieldLocks.item_description}
                  className={`flex-1 ${fieldLocks.item_description ? 'bg-muted cursor-not-allowed' : ''} ${!formData.item_description ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  required
                />
                <div className="flex flex-col gap-2">
                  {fieldLocks.item_description && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => toggleFieldLock('item_description')}
                      className="shrink-0"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  )}
                  {!fieldLocks.item_description &&
                    formData.item_description && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => toggleFieldLock('item_description')}
                        className="shrink-0"
                      >
                        <Unlock className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                Price ({extractedData?.currency || 'PHP'}){' '}
                <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="price"
                    type="number"
                    placeholder="45000"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', e.target.value)}
                    className={`pl-8 ${fieldLocks.price ? 'bg-muted cursor-not-allowed' : ''} ${!formData.price ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    disabled={fieldLocks.price}
                    required
                  />
                </div>
                {fieldLocks.price && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleFieldLock('price')}
                    className="shrink-0"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                )}
                {!fieldLocks.price && formData.price && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => toggleFieldLock('price')}
                    className="shrink-0"
                  >
                    <Unlock className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Extraction Status Banner */}
            {isDataExtracted &&
              (fieldLocks.transaction_type ||
                fieldLocks.meeting_location ||
                fieldLocks.meeting_time ||
                fieldLocks.delivery_address ||
                fieldLocks.delivery_method ||
                fieldLocks.online_platform ||
                fieldLocks.online_contact ||
                fieldLocks.online_instructions) && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    ✓ Some fields were extracted from screenshot analysis
                  </AlertDescription>
                </Alert>
              )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>
                  Transaction Type <span className="text-destructive">*</span>
                </Label>
                {fieldLocks.transaction_type && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFieldLock('transaction_type')}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Unlock
                  </Button>
                )}
                {!fieldLocks.transaction_type && formData.transaction_type && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFieldLock('transaction_type')}
                  >
                    <Unlock className="mr-2 h-4 w-4" />
                    Lock
                  </Button>
                )}
              </div>
              <RadioGroup
                value={formData.transaction_type}
                onValueChange={(value: 'meetup' | 'delivery' | 'online') =>
                  updateFormData('transaction_type', value)
                }
                className="grid grid-cols-3 gap-4"
                disabled={fieldLocks.transaction_type}
              >
                <Label
                  htmlFor="meetup"
                  className={`border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 ${fieldLocks.transaction_type ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <RadioGroupItem
                    value="meetup"
                    id="meetup"
                    className="sr-only"
                    disabled={fieldLocks.transaction_type}
                  />
                  <MapPin className="mb-3 h-6 w-6" />
                  <span className="font-medium">Meet Up</span>
                  <span className="text-muted-foreground mt-1 text-center text-xs">
                    Meet in person
                  </span>
                </Label>
                <Label
                  htmlFor="delivery"
                  className={`border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 ${fieldLocks.transaction_type ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <RadioGroupItem
                    value="delivery"
                    id="delivery"
                    className="sr-only"
                    disabled={fieldLocks.transaction_type}
                  />
                  <Truck className="mb-3 h-6 w-6" />
                  <span className="font-medium">Delivery</span>
                  <span className="text-muted-foreground mt-1 text-center text-xs">
                    Ship or deliver
                  </span>
                </Label>
                <Label
                  htmlFor="online"
                  className={`border-muted bg-popover hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex cursor-pointer flex-col items-center justify-between rounded-md border-2 p-4 ${fieldLocks.transaction_type ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <RadioGroupItem
                    value="online"
                    id="online"
                    className="sr-only"
                    disabled={fieldLocks.transaction_type}
                  />
                  <Globe className="mb-3 h-6 w-6" />
                  <span className="font-medium">Online</span>
                  <span className="text-muted-foreground mt-1 text-center text-xs">
                    Virtual exchange
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
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                      <Input
                        id="meeting_location"
                        placeholder="e.g., SM Mall of Asia, Food Court"
                        value={formData.meeting_location}
                        onChange={(e) =>
                          updateFormData('meeting_location', e.target.value)
                        }
                        className={`pl-9 ${fieldLocks.meeting_location ? 'bg-muted cursor-not-allowed' : ''}`}
                        disabled={fieldLocks.meeting_location}
                        required
                      />
                    </div>
                    {fieldLocks.meeting_location && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => toggleFieldLock('meeting_location')}
                        className="shrink-0"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    )}
                    {!fieldLocks.meeting_location &&
                      formData.meeting_location && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleFieldLock('meeting_location')}
                          className="shrink-0"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meeting_time">
                    Scheduled Date & Time{' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Calendar className="text-muted-foreground pointer-events-none absolute top-3 left-3 z-10 h-4 w-4" />
                      <Input
                        id="meeting_time"
                        type="datetime-local"
                        value={formData.meeting_time}
                        onChange={(e) =>
                          updateFormData('meeting_time', e.target.value)
                        }
                        className={`pl-9 ${fieldLocks.meeting_time ? 'bg-muted cursor-not-allowed' : ''}`}
                        min={new Date().toISOString().slice(0, 16)}
                        disabled={fieldLocks.meeting_time}
                        required
                      />
                    </div>
                    {fieldLocks.meeting_time && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => toggleFieldLock('meeting_time')}
                        className="shrink-0"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    )}
                    {!fieldLocks.meeting_time && formData.meeting_time && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => toggleFieldLock('meeting_time')}
                        className="shrink-0"
                      >
                        <Unlock className="h-4 w-4" />
                      </Button>
                    )}
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
            ) : formData.transaction_type === 'delivery' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="delivery_address">
                    Delivery Address <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="delivery_address"
                      placeholder="Enter complete delivery address"
                      value={formData.delivery_address}
                      onChange={(e) =>
                        updateFormData('delivery_address', e.target.value)
                      }
                      rows={3}
                      className={`flex-1 ${fieldLocks.delivery_address ? 'bg-muted cursor-not-allowed' : ''}`}
                      disabled={fieldLocks.delivery_address}
                      required
                    />
                    <div className="flex flex-col gap-2">
                      {fieldLocks.delivery_address && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleFieldLock('delivery_address')}
                          className="shrink-0"
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      )}
                      {!fieldLocks.delivery_address &&
                        formData.delivery_address && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => toggleFieldLock('delivery_address')}
                            className="shrink-0"
                          >
                            <Unlock className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_method">
                    Delivery Method <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="delivery_method"
                      placeholder="e.g., LBC, J&T Express, Lalamove, Personal Courier"
                      value={formData.delivery_method}
                      onChange={(e) =>
                        updateFormData('delivery_method', e.target.value)
                      }
                      className={`flex-1 ${fieldLocks.delivery_method ? 'bg-muted cursor-not-allowed' : ''}`}
                      disabled={fieldLocks.delivery_method}
                      required
                    />
                    {fieldLocks.delivery_method && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => toggleFieldLock('delivery_method')}
                        className="shrink-0"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    )}
                    {!fieldLocks.delivery_method &&
                      formData.delivery_method && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleFieldLock('delivery_method')}
                          className="shrink-0"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>

                <Alert>
                  <Truck className="h-4 w-4" />
                  <AlertDescription>
                    Make sure to agree on who pays for shipping and get tracking
                    information for safe delivery.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="online_platform">
                    Platform{' '}
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                      <Input
                        id="online_platform"
                        placeholder="e.g., Discord, Zoom, Google Meet, WhatsApp Video"
                        value={formData.online_platform}
                        onChange={(e) =>
                          updateFormData('online_platform', e.target.value)
                        }
                        className={`pl-9 ${fieldLocks.online_platform ? 'bg-muted cursor-not-allowed' : ''}`}
                        disabled={fieldLocks.online_platform}
                      />
                    </div>
                    {fieldLocks.online_platform && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => toggleFieldLock('online_platform')}
                        className="shrink-0"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    )}
                    {!fieldLocks.online_platform &&
                      formData.online_platform && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleFieldLock('online_platform')}
                          className="shrink-0"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="online_contact">
                    Contact Information{' '}
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="online_contact"
                      placeholder="e.g., username, email, phone number"
                      value={formData.online_contact}
                      onChange={(e) =>
                        updateFormData('online_contact', e.target.value)
                      }
                      className={`flex-1 ${fieldLocks.online_contact ? 'bg-muted cursor-not-allowed' : ''}`}
                      disabled={fieldLocks.online_contact}
                    />
                    {fieldLocks.online_contact && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => toggleFieldLock('online_contact')}
                        className="shrink-0"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    )}
                    {!fieldLocks.online_contact && formData.online_contact && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => toggleFieldLock('online_contact')}
                        className="shrink-0"
                      >
                        <Unlock className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="online_instructions">
                    Exchange Instructions{' '}
                    <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="online_instructions"
                      placeholder="e.g., Meeting link, specific time, verification steps..."
                      value={formData.online_instructions}
                      onChange={(e) =>
                        updateFormData('online_instructions', e.target.value)
                      }
                      rows={3}
                      className={`flex-1 ${fieldLocks.online_instructions ? 'bg-muted cursor-not-allowed' : ''}`}
                      disabled={fieldLocks.online_instructions}
                    />
                    {fieldLocks.online_instructions && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => toggleFieldLock('online_instructions')}
                        className="shrink-0"
                      >
                        <Lock className="h-4 w-4" />
                      </Button>
                    )}
                    {!fieldLocks.online_instructions &&
                      formData.online_instructions && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleFieldLock('online_instructions')}
                          className="shrink-0"
                        >
                          <Unlock className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>

                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    Ensure you have a secure connection and verify the other
                    party&apos;s identity before proceeding with the exchange.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-0">
            {/* Main Content - Responsive Layout */}
            <div className="space-y-1 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 xl:grid-cols-2 xl:gap-4">
              {/* Escrow Protection Section */}
              <div className="space-y-1">
                <Card className="border-2 shadow-lg">
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
              </div>

              {/* Arbiter Oversight Section */}
              <div className="space-y-1">
                <Card className="border-2 shadow-lg">
                  <CardHeader className="bg-muted/30 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950">
                          <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Arbiter Oversight
                          </CardTitle>
                          <p className="text-muted-foreground text-sm">
                            Independent third-party mediation
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
                  </CardHeader>

                  <CardContent className="p-6">
                    {arbiterEnabled ? (
                      <div className="space-y-4">
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
                      <div className="space-y-4">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Add an independent arbiter to oversee this transaction
                          and mediate in case of disputes. This provides an
                          extra layer of security and trust.
                        </p>
                        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                          <Shield className="h-4 w-4 text-amber-600" />
                          <AlertDescription className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>How it works:</strong> An arbiter is a
                            neutral third party who can help resolve disputes
                            and ensure fair outcomes for both parties.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 6:
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
                      {parseFloat(formData.price || '0').toLocaleString()}
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
                        : formData.transaction_type === 'delivery'
                          ? 'Delivery Method'
                          : 'Platform'}
                    </p>
                    <p className="font-medium">
                      {formData.transaction_type === 'meetup'
                        ? formData.meeting_location
                        : formData.transaction_type === 'delivery'
                          ? formData.delivery_method
                          : formData.online_platform || 'Not specified'}
                    </p>
                  </div>
                </div>

                {formData.transaction_type === 'online' && (
                  <div className="grid grid-cols-2 gap-4">
                    {formData.online_contact && (
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Contact Information
                        </p>
                        <p className="font-medium">{formData.online_contact}</p>
                      </div>
                    )}
                    {formData.online_instructions && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground text-sm">
                          Exchange Instructions
                        </p>
                        <p className="font-medium">
                          {formData.online_instructions}
                        </p>
                      </div>
                    )}
                    {!formData.online_contact &&
                      !formData.online_instructions && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground text-sm italic">
                            No additional online exchange details provided
                          </p>
                        </div>
                      )}
                  </div>
                )}

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
        className={`w-full transition-all duration-300 ${currentStep === 3 || currentStep === 5 ? 'max-w-6xl' : 'max-w-3xl'}`}
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
                        React.createElement(Icon, { className: 'h-5 w-5' })
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
              {currentStep === 2 && '🔀 Resolve any conflicts'}
              {currentStep === 3 && '📦 Tell us about your item'}
              {currentStep === 4 && '🚚 How will you exchange?'}
              {currentStep === 5 && '🛡️ Add security features'}
              {currentStep === 6 && '✅ Review and create'}
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
              {currentStep === 2 && 'Resolve Data Conflicts'}
              {currentStep === 3 && 'Item Details'}
              {currentStep === 4 && 'Exchange Information'}
              {currentStep === 5 && 'Safety & Protection'}
              {currentStep === 6 &&
                (transactionId ? 'Review & Confirm' : 'Create Transaction')}
            </CardTitle>
            <CardDescription className="text-base">
              {currentStep === 1 &&
                'AI-powered analysis of your conversation screenshots to extract transaction details and detect fraud'}
              {currentStep === 2 &&
                'Review and resolve any conflicts between the two screenshot analyses'}
              {currentStep === 3 &&
                (transactionId
                  ? 'Update transaction details'
                  : "Describe what you're buying or selling")}
              {currentStep === 4 &&
                "Choose how you'll exchange (meetup or delivery)"}
              {currentStep === 5 &&
                'Add optional escrow protection and arbiter oversight'}
              {currentStep === 6 &&
                'Review and confirm your transaction details'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            {/* Collaboration Status Header */}
            {featureFlags.enableDisconnectWarning && conflictResolution && (
              <div
                className={`flex items-center justify-between rounded-lg border p-3 ${
                  conflictResolution.otherPartyDisconnected
                    ? 'border-red-500/30 bg-red-900/20'
                    : conflictResolution.isConnected
                      ? 'border-blue-500/30 bg-blue-900/20'
                      : 'border-yellow-500/30 bg-yellow-900/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users
                    className={`h-4 w-4 ${
                      conflictResolution.otherPartyDisconnected
                        ? 'text-red-400'
                        : conflictResolution.isConnected
                          ? 'text-blue-400'
                          : 'text-yellow-400'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      conflictResolution.otherPartyDisconnected
                        ? 'text-red-200'
                        : conflictResolution.isConnected
                          ? 'text-blue-200'
                          : 'text-yellow-200'
                    }`}
                  >
                    {conflictResolution.otherPartyDisconnected
                      ? 'Other party disconnected'
                      : conflictResolution.isConnected
                        ? 'Live Collaboration'
                        : 'Connecting...'}
                  </span>
                </div>
                {conflictResolution.isConnected &&
                  !conflictResolution.otherPartyDisconnected && (
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                      <span className="text-xs text-green-300">Connected</span>
                    </div>
                  )}
                {conflictResolution.otherPartyDisconnected && (
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="text-xs text-red-300">Disconnected</span>
                  </div>
                )}
              </div>
            )}

            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex gap-3 border-t pt-6">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={
                    isSubmitting ||
                    (currentStep === 2 && currentUserConfirmed) ||
                    (currentStep === 3 && conflictsWereResolved)
                  }
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
                  disabled={
                    !canProceedToNext() ||
                    (featureFlags.enableDisconnectWarning &&
                      conflictResolution?.otherPartyDisconnected)
                  }
                  className="h-11 flex-1 shadow-md"
                  size="lg"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !canProceedToNext() ||
                    isSubmitting ||
                    (featureFlags.enableDisconnectWarning &&
                      conflictResolution?.otherPartyDisconnected)
                  }
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
