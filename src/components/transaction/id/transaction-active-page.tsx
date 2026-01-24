'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { DBTransaction } from '@/types/transaction';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  Clock,
  Upload,
  Shield,
  MapPin,
  Calendar,
  Package,
  User,
  AlertCircle,
  ArrowRight,
  Eye,
  Loader2,
} from 'lucide-react';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface TransactionActivePageProps {
  transactionId: string;
}

export function TransactionActivePage({
  transactionId,
}: TransactionActivePageProps) {
  const router = useRouter();
  const { status, loading } = useTransactionStatus(transactionId);
  const [transaction, setTransaction] = useState<DBTransaction | null>(null);
  const [escrowData, setEscrowData] = useState<{
    id: string;
    status: string;
    deliverables: unknown[];
    arbiter_required?: boolean;
  } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch transaction details
  useEffect(() => {
    const fetchTransaction = async () => {
      const supabase = createClient();

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      // Fetch transaction
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (txError) {
        console.error('Error fetching transaction:', txError);
        toast.error('Failed to load transaction');
        return;
      }

      setTransaction(txData);

      // Fetch escrow if exists
      const { data: escrowList } = await supabase
        .from('escrows')
        .select('*, deliverables(*)')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (escrowList && escrowList.length > 0) {
        setEscrowData(escrowList[0]);
      }
    };

    fetchTransaction();
  }, [transactionId]);

  // Auto-navigate based on status changes
  useEffect(() => {
    if (
      status?.is_ready_for_next_step &&
      status.transaction.status === 'screenshots_uploaded'
    ) {
      toast.success(
        'Both screenshots uploaded! Redirecting to transaction view...'
      );
      setTimeout(() => {
        router.push(ROUTES.TRANSACTION.VIEW(transactionId));
      }, 1500);
    }
  }, [status, transactionId, router]);

  if (loading || !transaction) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 pt-14">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isCreator = currentUserId === transaction.creator_id;
  const hasUploadedScreenshot = status?.participants.some(
    (p) => p.user_id === currentUserId && p.screenshot_url
  );
  const otherPartyUploaded = status?.participants.some(
    (p) => p.user_id !== currentUserId && p.screenshot_url
  );
  const bothUploaded =
    status?.participants.filter((p) => p.screenshot_url).length === 2;

  const getStatusInfo = () => {
    if (bothUploaded) {
      return {
        icon: CheckCircle2,
        text: 'Screenshots Uploaded',
        color: 'text-green-600',
        bgColor: 'bg-green-50
        borderColor: 'border-green-200
      };
    }
    if (hasUploadedScreenshot) {
      return {
        icon: Clock,
        text: 'Waiting for Other Party',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50
        borderColor: 'border-amber-200
      };
    }
    return {
      icon: Upload,
      text: 'Upload Required',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50
      borderColor: 'border-blue-200
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-background flex min-h-screen w-full flex-col p-4 pt-20 pb-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Transaction Active
          </h1>
          <p className="text-muted-foreground">
            Manage your ongoing transaction and complete verification steps
          </p>
        </div>

        {/* Status Alert */}
        <Alert
          className={`${statusInfo.bgColor} ${statusInfo.borderColor} border`}
        >
          {React.createElement(StatusIcon, {
            className: `h-4 w-4 ${statusInfo.color}`,
          })}
          <AlertDescription className={statusInfo.color}>
            <strong>{statusInfo.text}</strong>
            <br />
            {!hasUploadedScreenshot &&
              'Please upload a screenshot of your conversation to verify the transaction.'}
            {hasUploadedScreenshot &&
              !bothUploaded &&
              'Your screenshot has been uploaded. Waiting for the other party to upload theirs.'}
            {bothUploaded &&
              'Both parties have uploaded screenshots. AI verification in progress.'}
          </AlertDescription>
        </Alert>

        {/* Transaction Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {transaction.item_name || 'Transaction Details'}
                </CardTitle>
                <CardDescription>
                  Transaction ID: {transactionId.slice(0, 8)}...
                </CardDescription>
              </div>
              <Badge variant={isCreator ? 'default' : 'secondary'}>
                {isCreator ? 'Creator' : 'Participant'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Item Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Item Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Description</p>
                  <p className="text-sm">
                    {transaction.item_description || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Price</p>
                  <p className="text-lg font-semibold">
                    ₱{Number(transaction.price ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Meeting Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Meeting Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Location</p>
                    <p className="text-sm">
                      {transaction.meeting_location || 'To be determined'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      Scheduled Time
                    </p>
                    <p className="text-sm">
                      {transaction.meeting_time
                        ? new Date(transaction.meeting_time).toLocaleString()
                        : 'To be determined'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Information */}
            {escrowData && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Shield className="h-4 w-4 text-green-600" />
                  Escrow Protection
                </h3>
                <Alert className="border-green-200 bg-green-50
                  <Shield className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-800
                    <strong>Protected Transaction</strong>
                    <br />
                    This transaction is protected by escrow with{' '}
                    {escrowData.deliverables?.length || 0} deliverable(s).
                    {escrowData.arbiter_required &&
                      ' An arbiter will oversee the transaction.'}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Upload Progress */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Verification Progress</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        hasUploadedScreenshot
                          ? 'bg-green-100
                          : 'bg-muted'
                      }`}
                    >
                      {hasUploadedScreenshot ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <User className="text-muted-foreground h-4 w-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium">Your Screenshot</span>
                  </div>
                  {hasUploadedScreenshot ? (
                    <Badge variant="outline" className="bg-green-50">
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        otherPartyUploaded
                          ? 'bg-green-100
                          : 'bg-muted'
                      }`}
                    >
                      {otherPartyUploaded ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <User className="text-muted-foreground h-4 w-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium">
                      Other Party&apos;s Screenshot
                    </span>
                  </div>
                  {otherPartyUploaded ? (
                    <Badge variant="outline" className="bg-green-50">
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Upload Screenshot */}
          {!hasUploadedScreenshot && (
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="h-5 w-5" />
                  Upload Screenshot
                </CardTitle>
                <CardDescription>
                  Upload a screenshot of your conversation for verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(
                      `${ROUTES.TRANSACTION.UPLOAD}?id=${transactionId}`
                    )
                  }
                >
                  Upload Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* View Full Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-5 w-5" />
                View Details
              </CardTitle>
              <CardDescription>
                See complete transaction information and history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  router.push(ROUTES.TRANSACTION.VIEW(transactionId))
                }
              >
                View Transaction
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Escrow Details */}
          {escrowData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                  Escrow Details
                </CardTitle>
                <CardDescription>
                  Manage escrow deliverables and releases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(ROUTES.ESCROW.VIEW(escrowData.id))}
                >
                  View Escrow
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Report Issue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Report Issue
              </CardTitle>
              <CardDescription>
                Report a problem with this transaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(ROUTES.USER.ROOT)}
              >
                Report
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Back to Home */}
        <div className="flex justify-center pt-4">
          <Button variant="ghost" asChild>
            <Link href={ROUTES.USER.ROOT}>Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
