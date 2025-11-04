'use client';

import { useEffect, useState } from 'react';
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
import { AlertCircle } from 'lucide-react';

interface ConfirmationDialogProps {
  onConfirm: (messageId: string, confirmed: boolean) => void;
}

interface ConfirmationEvent {
  messageId: string;
  field: string;
  value: unknown;
  userName: string;
  step?: number;
}

export function ConfirmationDialog({ onConfirm }: ConfirmationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationData, setConfirmationData] =
    useState<ConfirmationEvent | null>(null);

  useEffect(() => {
    const handleConfirmationRequired = (event: Event) => {
      const customEvent = event as CustomEvent<ConfirmationEvent>;
      setConfirmationData(customEvent.detail);
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

  const handleConfirm = () => {
    if (confirmationData) {
      onConfirm(confirmationData.messageId, true);
      setIsOpen(false);
      setConfirmationData(null);
    }
  };

  const handleReject = () => {
    if (confirmationData) {
      onConfirm(confirmationData.messageId, false);
      setIsOpen(false);
      setConfirmationData(null);
    }
  };

  if (!confirmationData) return null;

  const fieldLabels: Record<string, string> = {
    item_name: 'Item Name',
    product_model: 'Product Model',
    item_description: 'Description',
    price: 'Price',
    quantity: 'Quantity',
    condition: 'Condition',
    category: 'Category',
    meeting_location: 'Meeting Location',
    meeting_time: 'Meeting Time',
    delivery_address: 'Delivery Address',
    delivery_method: 'Delivery Method',
  };

  const stepNames = [
    '',
    'Screenshot Analysis',
    'Resolve Conflicts',
    'Item Details',
    'Exchange Info',
    'Safety Options',
    'Review',
  ];

  const fieldLabel =
    fieldLabels[confirmationData.field] || confirmationData.field;
  const stepName =
    confirmationData.step && confirmationData.step < stepNames.length
      ? stepNames[confirmationData.step]
      : 'Unknown';

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Confirm Change Request
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                <strong>{confirmationData.userName}</strong> wants to change the
                following field:
              </p>
              <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Field:</span>
                  <Badge variant="outline">{fieldLabel}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Step:</span>
                  <Badge variant="secondary">{stepName}</Badge>
                </div>
                <div className="border-t pt-2">
                  <span className="text-sm font-medium">New Value:</span>
                  <p className="text-foreground mt-1 font-mono text-sm">
                    {typeof confirmationData.value === 'object'
                      ? JSON.stringify(confirmationData.value, null, 2)
                      : String(confirmationData.value)}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm">
                Do you want to accept this change?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleReject}>
            Reject Change
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Accept Change
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
