'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FieldChangeApprovalProps {
  onRespond: (messageId: string, confirmed: boolean) => void;
  onApprove?: (field: string, value: unknown) => void;
  onReject?: (field: string) => void;
}

interface ConfirmationEvent {
  messageId: string;
  field: string;
  value: unknown;
  userName: string;
  step?: number;
}

export function FieldChangeApproval({
  onRespond,
  onApprove,
  onReject,
}: FieldChangeApprovalProps) {
  const [currentConfirmation, setCurrentConfirmation] =
    useState<ConfirmationEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Listen for confirmation requests from WebSocket
  useEffect(() => {
    const handleConfirmationRequired = (event: Event) => {
      const customEvent = event as CustomEvent<ConfirmationEvent>;
      setCurrentConfirmation(customEvent.detail);
      setIsOpen(true);
    };

    window.addEventListener(
      'transaction-confirmation-required',
      handleConfirmationRequired
    );

    return () => {
      window.removeEventListener(
        'transaction-confirmation-required',
        handleConfirmationRequired
      );
    };
  }, []);

  const handleApprove = useCallback(() => {
    if (currentConfirmation) {
      onRespond(currentConfirmation.messageId, true);

      // Callback to parent to apply the change
      if (onApprove) {
        onApprove(currentConfirmation.field, currentConfirmation.value);
      }

      toast.success('Change approved', {
        description: `Accepted ${currentConfirmation.userName}'s change`,
        icon: <CheckCircle className="h-4 w-4" />,
      });

      setIsOpen(false);
      setCurrentConfirmation(null);
    }
  }, [currentConfirmation, onRespond, onApprove]);

  const handleReject = useCallback(() => {
    if (currentConfirmation) {
      onRespond(currentConfirmation.messageId, false);

      // Callback to parent
      if (onReject) {
        onReject(currentConfirmation.field);
      }

      toast.error('Change rejected', {
        description: `Rejected ${currentConfirmation.userName}'s change`,
        icon: <XCircle className="h-4 w-4" />,
      });

      setIsOpen(false);
      setCurrentConfirmation(null);
    }
  }, [currentConfirmation, onRespond, onReject]);

  if (!currentConfirmation) return null;

  const fieldLabels: Record<string, string> = {
    product_name: 'Product Name',
    product_model: 'Product Model',
    description: 'Description',
    price: 'Price',
    quantity: 'Quantity',
    condition: 'Condition',
    category: 'Category',
    meeting_location: 'Meeting Location',
    meeting_time: 'Meeting Time',
    delivery_address: 'Delivery Address',
    delivery_method: 'Delivery Method',
    platform: 'Platform',
    transaction_type: 'Transaction Type',
  };

  const stepNames = [
    '',
    'Screenshot Analysis',
    'Resolve Conflicts',
    'Item Details',
    'Exchange Details',
    'Safety Options',
    'Review',
  ];

  const fieldLabel =
    fieldLabels[currentConfirmation.field] || currentConfirmation.field;
  const stepName =
    currentConfirmation.step && currentConfirmation.step < stepNames.length
      ? stepNames[currentConfirmation.step]
      : 'Unknown';

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Review Change Request
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-sm">
                <strong className="text-foreground">
                  {currentConfirmation.userName}
                </strong>{' '}
                wants to update a field:
              </p>

              <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium">
                    Field
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {fieldLabel}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium">
                    Section
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {stepName}
                  </Badge>
                </div>

                <div className="space-y-1 border-t pt-2">
                  <span className="text-muted-foreground text-xs font-medium">
                    Proposed Value
                  </span>
                  <div className="bg-background mt-1 rounded border p-2">
                    <p className="text-foreground font-mono text-sm break-all">
                      {typeof currentConfirmation.value === 'object'
                        ? JSON.stringify(currentConfirmation.value, null, 2)
                        : String(currentConfirmation.value || '(empty)')}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-xs">
                This change will update the transaction details. Do you approve?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleReject} className="gap-2">
            <XCircle className="h-4 w-4" />
            Reject
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleApprove} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Approve
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
