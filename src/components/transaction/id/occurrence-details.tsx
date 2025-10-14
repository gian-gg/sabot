import { Card, CardContent } from '@/components/ui/card';
import {
  MapPin,
  Clock,
  AlertCircle,
  MapPinned,
  CheckCircle,
  Flag,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import React from 'react';

type Dispute = {
  id: string;
  reason: string;
  status: 'open' | 'resolved' | 'rejected';
  createdAt: string;
};

type OccurrenceDetailsProps = {
  transactionOccurrence: {
    location: string;
    exactLocation: string;
    scheduledTime: string;
    actualTime: string | null;
    disputes: Dispute[];
    status: string;
  };
  reportOpen: boolean;
  setReportOpen: (open: boolean) => void;
  reportNotes: string;
  setReportNotes: (notes: string) => void;
  handleReport: () => void;
};

export function OccurrenceDetailsCard({
  transactionOccurrence,
  reportOpen,
  setReportOpen,
  reportNotes,
  setReportNotes,
  handleReport,
}: OccurrenceDetailsProps) {
  return (
    <React.Fragment>
      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Location</p>
                <p className="text-sm font-medium text-white">
                  {transactionOccurrence.location}
                </p>
                <p className="text-xs text-neutral-400">
                  {transactionOccurrence.exactLocation}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Scheduled Time</p>
                <p className="text-sm font-medium text-white">
                  {transactionOccurrence.scheduledTime}
                </p>
                {transactionOccurrence.actualTime && (
                  <p className="text-xs text-emerald-400">
                    Completed: {transactionOccurrence.actualTime}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-neutral-400" />
              <div>
                <p className="text-xs text-neutral-500">Disputes</p>
                <p className="text-sm font-medium text-white">
                  {transactionOccurrence.disputes.length === 0
                    ? 'None'
                    : `${transactionOccurrence.disputes.length} active`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="flex aspect-video items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900">
            <div className="text-center">
              <MapPinned className="mx-auto mb-2 h-12 w-12 text-neutral-600" />
              <p className="text-sm text-neutral-500">Map View</p>
              <p className="mt-1 text-xs text-neutral-600">
                Location pinned on map
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center py-6">
            {transactionOccurrence.status === 'completed' && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)]">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <p className="text-lg font-semibold text-emerald-400">
                  Completed
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Transaction successful
                </p>
              </div>
            )}
            {transactionOccurrence.status === 'pending' && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.6)]">
                  <Clock className="h-10 w-10 text-white" />
                </div>
                <p className="text-lg font-semibold text-yellow-400">Pending</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Awaiting confirmation
                </p>
              </div>
            )}
            {transactionOccurrence.status === 'active' && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)]">
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                </div>
                <p className="text-lg font-semibold text-blue-400">Active</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Transaction in progress
                </p>
              </div>
            )}
            {transactionOccurrence.status === 'disputed' && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                  <AlertCircle className="h-10 w-10 text-white" />
                </div>
                <p className="text-lg font-semibold text-red-400">Disputed</p>
                <p className="mt-1 text-xs text-neutral-500">Issue reported</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10"
          >
            <Flag className="mr-2 h-4 w-4" />
            Report Issue
          </Button>
        </DialogTrigger>
        <DialogContent className="border-neutral-800 bg-neutral-900">
          <DialogHeader>
            <DialogTitle className="text-white">
              Report Transaction Issue
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Describe the issue you encountered with this transaction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-neutral-200">
                Issue Description
              </Label>
              <Input
                id="notes"
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                className="border-neutral-700 bg-black/40 text-white"
                placeholder="Describe what went wrong..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportOpen(false)}
              className="border-neutral-700 text-neutral-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReport}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={!reportNotes.trim()}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
