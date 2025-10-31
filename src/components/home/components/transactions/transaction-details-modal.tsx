'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { exportTransactionToPDF } from '@/lib/pdf/export-transaction';
import { cn } from '@/lib/utils';
import type { TransactionStatus } from '@/types/transaction';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
  Shield,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils/helpers';

interface TransactionDetails {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_email: string;
  creator_avatar_url: string | null | undefined;
  status: TransactionStatus;
  item_name: string;
  item_description: string;
  price: number;
  meeting_location: string | null | undefined;
  meeting_time: string | null | undefined;
  delivery_address: string | null | undefined;
  delivery_method: string | null | undefined;
  online_platform: string | null | undefined;
  online_contact: string | null | undefined;
  online_instructions: string | null | undefined;
  category: string;
  condition: string;
  quantity: number;
  transaction_type: 'meetup' | 'delivery' | 'online';
  hash: string | null | undefined;
  created_at: string;
  updated_at: string;
}

const statusIcons: Record<TransactionStatus, React.ElementType> = {
  completed: CheckCircle2,
  active: Activity,
  pending: Clock,
  disputed: XCircle,
  reported: AlertCircle,
  waiting_for_participant: Clock,
  both_joined: Users,
  screenshots_uploaded: Shield,
  cancelled: XCircle,
};

const statusColors: Record<TransactionStatus, string> = {
  completed: 'text-green-500 bg-green-500/10 border-green-500/20',
  active: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  pending: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  disputed: 'text-red-500 bg-red-500/10 border-red-500/20',
  reported: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  waiting_for_participant:
    'text-purple-500 bg-purple-500/10 border-purple-500/20',
  both_joined: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  screenshots_uploaded:
    'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  cancelled: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
};

interface TransactionDetailsModalProps {
  transaction: TransactionDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsModal({
  transaction,
  open,
  onOpenChange,
}: TransactionDetailsModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!transaction) return null;

  const StatusIcon = statusIcons[transaction.status];

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopiedId(true);
    toast.success('Transaction ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportTransactionToPDF(transaction);
      toast.success('Transaction exported to PDF successfully');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export transaction to PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // Mock timeline data
  const timeline = [
    {
      event: 'Transaction created',
      date: transaction.created_at,
      status: 'completed' as const,
    },
    {
      event: 'Participant invited',
      date: transaction.created_at,
      status: 'completed' as const,
    },
    {
      event: 'Payment processed',
      date: transaction.updated_at,
      status:
        transaction.status === 'completed'
          ? ('completed' as const)
          : ('pending' as const),
    },
    { event: 'Item delivered', date: '-', status: 'pending' as const },
  ];

  // Determine transaction type label
  const transactionTypeLabel =
    transaction.transaction_type === 'meetup'
      ? 'In-Person Meetup'
      : transaction.transaction_type === 'delivery'
        ? 'Delivery'
        : 'Online Transaction';

  // Get location based on transaction type
  const getLocation = () => {
    if (transaction.transaction_type === 'meetup')
      return transaction.meeting_location;
    if (transaction.transaction_type === 'delivery')
      return transaction.delivery_address;
    if (transaction.transaction_type === 'online')
      return transaction.online_platform;
    return undefined;
  };

  const location = getLocation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-md overflow-y-auto md:min-w-xl lg:min-w-4xl xl:min-w-5xl">
        <DialogHeader>
          <div>
            <DialogTitle>{transaction.item_name}</DialogTitle>
            <DialogDescription>Transaction #{transaction.id}</DialogDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'px-4 py-1 text-xs',
              statusColors[transaction.status]
            )}
          >
            <StatusIcon className="mr-2 h-4 w-4" />
            {transaction.status}
          </Badge>
        </DialogHeader>

        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-border/50 bg-muted/20 border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center">
                  <DollarSign className="text-primary h-6 w-6" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Price
                  </p>
                  <p className="font-bold">
                    ${transaction.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-border/50 bg-muted/20 border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center bg-blue-500/10">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Created
                  </p>
                  <p className="text-sm font-semibold">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-border/50 bg-muted/20 border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center bg-purple-500/10">
                  <User className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Creator
                  </p>
                  <p className="text-sm font-semibold">
                    {transaction.creator_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-border/50 bg-muted/20 border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center bg-amber-500/10">
                  <FileText className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Type
                  </p>
                  <p className="text-sm font-semibold">
                    {transactionTypeLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout for Details */}
          <div className="h-auto w-full">
            {/* Left Column - Transaction Details */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <FileText className="h-5 w-5" />
                  Transaction Details
                </h3>
                <div className="border-border/50 grid gap-4 space-y-4 border p-4 lg:grid-cols-2">
                  {transaction.item_description && (
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <MessageSquare className="text-muted-foreground h-4 w-4" />
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Description
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {transaction.item_description}
                      </p>
                    </div>
                  )}

                  {transaction.category && (
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <FileText className="text-muted-foreground h-4 w-4" />
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Category
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        {transaction.category}
                      </Badge>
                    </div>
                  )}

                  {location && (
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          {transaction.transaction_type === 'meetup' &&
                            'Meeting Location'}
                          {transaction.transaction_type === 'delivery' &&
                            'Delivery Address'}
                          {transaction.transaction_type === 'online' &&
                            'Platform'}
                        </p>
                      </div>
                      <p className="text-sm">{location}</p>
                    </div>
                  )}

                  {transaction.condition && (
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <FileText className="text-muted-foreground h-4 w-4" />
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Condition
                        </p>
                      </div>
                      <p className="text-sm capitalize">
                        {transaction.condition}
                      </p>
                    </div>
                  )}

                  {transaction.quantity && (
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <FileText className="text-muted-foreground h-4 w-4" />
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Quantity
                        </p>
                      </div>
                      <p className="text-sm">{transaction.quantity}</p>
                    </div>
                  )}

                  {transaction.meeting_time && (
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Meeting Time
                        </p>
                      </div>
                      <p className="text-sm">
                        {formatDate(transaction.meeting_time)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 p-4 sm:flex-row">
            <Button variant="default" className="flex-1" size="lg">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact Counterparty
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Blockchain
            </Button>
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              variant="outline"
              size="lg"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
