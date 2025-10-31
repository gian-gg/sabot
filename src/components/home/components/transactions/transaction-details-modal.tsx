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
import { cn } from '@/lib/utils';
import type { TransactionStatus } from '@/types/transaction';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
  Shield,
  User,
  Users,
  XCircle,
  Download,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { exportTransactionToPDF } from '@/lib/pdf/export-transaction';

interface TransactionDetails {
  id: string;
  type: string;
  item: string;
  amount: number;
  status: TransactionStatus;
  date: string;
  counterparty: string;
  description?: string;
  category?: string;
  location?: string;
  paymentMethod?: string;
  escrowStatus?: string;
  timeline?: {
    event: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
  }[];
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
  const timeline = transaction.timeline || [
    {
      event: 'Transaction created',
      date: transaction.date,
      status: 'completed' as const,
    },
    {
      event: 'Participant joined',
      date: transaction.date,
      status: 'completed' as const,
    },
    {
      event: 'Payment processed',
      date: transaction.date,
      status:
        transaction.status === 'completed'
          ? ('completed' as const)
          : ('pending' as const),
    },
    { event: 'Item delivered', date: '-', status: 'pending' as const },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-md overflow-y-auto md:min-w-xl lg:min-w-4xl xl:min-w-5xl">
        <DialogHeader>
          <div>
            <DialogTitle>{transaction.item}</DialogTitle>
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
            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <DollarSign className="text-primary h-6 w-6" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Amount
                  </p>
                  <p className="font-bold">
                    ${transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                  <Calendar className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Date
                  </p>
                  <p className="font-semibold">{transaction.date}</p>
                </div>
              </div>
            </div>

            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                  <User className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Counterparty
                  </p>
                  <p className="font-semibold">{transaction.counterparty}</p>
                </div>
              </div>
            </div>

            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                  <FileText className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Type
                  </p>
                  <p className="font-semibold">{transaction.type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout for Details */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Transaction Details */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <FileText className="h-5 w-5" />
                  Transaction Details
                </h3>
                <div className="border-border/50 space-y-4 rounded-lg border p-4">
                  {transaction.description && (
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <MessageSquare className="text-muted-foreground h-4 w-4" />
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Description
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {transaction.description}
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

                  {transaction.location && (
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <MapPin className="text-muted-foreground h-4 w-4" />
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Location
                        </p>
                      </div>
                      <p className="text-sm">{transaction.location}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment & Escrow Info */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold">
                  <Shield className="h-5 w-5" />
                  Payment & Security
                </h3>
                <div className="border-border/50 space-y-4 rounded-lg border p-4">
                  {transaction.paymentMethod && (
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <DollarSign className="text-muted-foreground h-4 w-4" />
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Payment Method
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {transaction.paymentMethod}
                      </p>
                    </div>
                  )}

                  {transaction.escrowStatus && (
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Shield className="text-muted-foreground h-4 w-4" />
                        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          Escrow Status
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-sm',
                          transaction.escrowStatus
                            .toLowerCase()
                            .includes('released') ||
                            transaction.escrowStatus
                              .toLowerCase()
                              .includes('completed')
                            ? 'border-green-500/20 bg-green-500/10 text-green-500'
                            : 'border-blue-500/20 bg-blue-500/10 text-blue-500'
                        )}
                      >
                        {transaction.escrowStatus}
                      </Badge>
                    </div>
                  )}

                  {/* Transaction ID */}
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <FileText className="text-muted-foreground h-4 w-4" />
                      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Transaction ID
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted flex-1 rounded border px-3 py-1.5 font-mono text-xs">
                        {transaction.id}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyTransactionId}
                        className="h-8 shrink-0"
                      >
                        {copiedId ? (
                          <CheckCircle2 className="text-primary h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Timeline */}
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-semibold">
                <Clock className="h-5 w-5" />
                Transaction Timeline
              </h3>
              <div className="border-border/50 relative rounded-lg border p-4">
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div
                      key={index}
                      className="relative flex gap-4 pb-4 last:pb-0"
                    >
                      {/* Timeline line */}
                      {index < timeline.length - 1 && (
                        <div className="bg-border absolute top-6 left-4 h-full w-px" />
                      )}

                      {/* Icon */}
                      <div
                        className={cn(
                          'relative z-10 mt-2 ml-2 flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                          item.status === 'completed' &&
                            'border-green-500 bg-green-500/10',
                          item.status === 'pending' &&
                            'border-amber-500 bg-amber-500/10',
                          item.status === 'failed' &&
                            'border-red-500 bg-red-500/10'
                        )}
                      ></div>

                      {/* Content */}
                      <div className="flex-1 pt-0.5">
                        <p className="font-medium">{item.event}</p>
                        <p className="text-muted-foreground text-sm">
                          {item.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-border/50 bg-muted/20 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row">
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
