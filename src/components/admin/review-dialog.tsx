'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { idOptions } from '@/constants/verify';
import type { IdType, VerificationRequests } from '@/types/verify';
import { toast } from 'sonner';
import { ExternalLink, UserCheck, Ban } from 'lucide-react';
import StatusBadge from './status-badge';
import { formatDate } from '@/lib/utils/helpers';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: VerificationRequests | null;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  isProcessing?: boolean;
};

export default function ReviewDialog({
  open,
  onOpenChange,
  request,
  onApprove,
  onReject,
  isProcessing = false,
}: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!open || !request) return;
      setIsLoadingImage(true);
      try {
        const res = await fetch('/api/storage/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bucket: 'verification-ids',
            path: request.userGovIDPath,
            expiresIn: 3600,
          }),
        });
        if (!res.ok) throw new Error('Failed to create signed URL');
        const json = (await res.json()) as { signedUrl: string | null };
        setImageUrl(json.signedUrl);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load ID document image');
        setImageUrl(null);
      } finally {
        setIsLoadingImage(false);
      }
    };
    load();
  }, [open, request]);

  const getIdTypeLabel = (idType: IdType) => {
    return idOptions.find((opt) => opt.id === idType)?.label || idType;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-xl overflow-y-auto lg:min-w-2xl xl:min-w-4xl">
        <DialogHeader>
          <DialogTitle>Verification Request Review</DialogTitle>
          <DialogDescription>
            Review the user&apos;s submitted information and documents
          </DialogDescription>
        </DialogHeader>
        {request && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-sm font-semibold">
                ID Document Preview
              </h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="relative aspect-[16/9] overflow-hidden rounded-lg border sm:aspect-[21/9] md:aspect-[3/2]">
                  {isLoadingImage ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="text-muted-foreground flex flex-col items-center gap-2">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
                        <p className="text-sm">Loading image...</p>
                      </div>
                    </div>
                  ) : imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Government ID"
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        Failed to load image
                      </p>
                    </div>
                  )}
                </div>
                {imageUrl && (
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary mt-3 flex items-center justify-center gap-2 text-sm hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </a>
                )}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold">User Information</h3>
                <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Name:</span>
                    <span className="font-medium">{request.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Email:
                    </span>
                    <span className="font-medium">{request.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      User ID:
                    </span>
                    <span className="font-mono text-xs">{request.userID}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Submitted:
                    </span>
                    <span className="text-sm">
                      {formatDate(request.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      Status:
                    </span>
                    <StatusBadge status={request.status} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold">
                  Government ID Details
                </h3>
                <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">
                      ID Type:
                    </span>
                    <Badge variant="secondary">
                      {getIdTypeLabel(
                        request.governmentIdInfo.idType || 'passport'
                      )}
                    </Badge>
                  </div>
                  {request.governmentIdInfo.firstName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        First Name:
                      </span>
                      <span className="font-medium">
                        {request.governmentIdInfo.firstName}
                      </span>
                    </div>
                  )}
                  {request.governmentIdInfo.middleName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Middle Name:
                      </span>
                      <span className="font-medium">
                        {request.governmentIdInfo.middleName}
                      </span>
                    </div>
                  )}
                  {request.governmentIdInfo.lastName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Last Name:
                      </span>
                      <span className="font-medium">
                        {request.governmentIdInfo.lastName}
                      </span>
                    </div>
                  )}
                  {request.governmentIdInfo.idNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        ID Number:
                      </span>
                      <span className="font-mono text-sm">
                        {request.governmentIdInfo.idNumber}
                      </span>
                    </div>
                  )}
                  {request.governmentIdInfo.dateOfBirth && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Date of Birth:
                      </span>
                      <span className="text-sm">
                        {request.governmentIdInfo.dateOfBirth}
                      </span>
                    </div>
                  )}
                  {request.governmentIdInfo.sex && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Sex:
                      </span>
                      <span className="text-sm">
                        {request.governmentIdInfo.sex}
                      </span>
                    </div>
                  )}
                  {request.governmentIdInfo.address && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Address:
                      </span>
                      <span className="max-w-xs text-right text-sm">
                        {request.governmentIdInfo.address}
                      </span>
                    </div>
                  )}
                  {request.governmentIdInfo.issueDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Issue Date:
                      </span>
                      <span className="text-sm">
                        {request.governmentIdInfo.issueDate}
                      </span>
                    </div>
                  )}
                  {request.governmentIdInfo.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">
                        Expiry Date:
                      </span>
                      <span className="text-sm">
                        {request.governmentIdInfo.expiryDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">
                Verification Metrics
              </h3>
              <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Face Match Confidence:
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-2 w-24 overflow-hidden rounded-full">
                      <div
                        className={`h-full ${
                          (request.faceMathchConfidence ?? 0) >= 0.85
                            ? 'bg-primary'
                            : (request.faceMathchConfidence ?? 0) >= 0.7
                              ? 'bg-yellow-500'
                              : 'bg-destructive'
                        }`}
                        style={{
                          width: `${(request.faceMathchConfidence ?? 0) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {((request.faceMathchConfidence ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {request.governmentIdInfo.notes && (
              <div>
                <h3 className="mb-3 text-sm font-semibold">Notes</h3>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">{request.governmentIdInfo.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          {request?.status === 'pending' ||
          request?.status === 'not-started' ? (
            <>
              <Button
                variant="outline"
                onClick={onReject}
                disabled={isProcessing}
                className="gap-2"
              >
                <Ban className="h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={onApprove}
                disabled={isProcessing}
                className="gap-2"
              >
                <UserCheck className="h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Approve'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
