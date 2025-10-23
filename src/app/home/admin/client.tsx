'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/store/user/userStore';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

import Denied from '@/components/admin/denied';
import { toast } from 'sonner';
import { updateUserVerificationStatus } from '@/lib/supabase/db/user';
import { deleteVerificationRequest } from '@/lib/supabase/db/verify';
import ReviewDialog from '@/components/admin/review-dialog';
import VerificationTable from '@/components/admin/verification-table';

import type { VerificationRequests } from '@/types/verify';

const AdminClient = ({ requests }: { requests: VerificationRequests[] }) => {
  const router = useRouter();
  const user = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequests | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (user.role !== 'admin') {
    return <Denied />;
  }

  const handleOpenModal = (request: VerificationRequests) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      await updateUserVerificationStatus(selectedRequest.userID, 'complete');
      toast.success(`${selectedRequest.userName}'s verification approved.`);
      handleCloseModal();
      router.refresh();
    } catch (error) {
      toast.error(
        'Failed to approve verification. Please try again.  Error:' + error
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      await deleteVerificationRequest(selectedRequest.id);
      await updateUserVerificationStatus(selectedRequest.userID, 'not-started');
      toast.success(`${selectedRequest.userName}'s verification rejected.`);
      handleCloseModal();
      router.refresh();
    } catch (error) {
      toast.error(
        'Failed to reject verification. Please try again. Error:' + error
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle case when requests is undefined or null
  const safeRequests = requests || [];

  const filteredRequests = safeRequests.filter((req) => {
    const matchesSearch =
      req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage verification requests and user accounts
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Requests</CardTitle>
          <CardDescription>
            Review and manage user verification submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="complete">Approved</SelectItem>
                  <SelectItem value="not-started">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <VerificationTable
            requests={filteredRequests}
            onReview={handleOpenModal}
          />
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <ReviewDialog
        open={isModalOpen}
        onOpenChange={(open) =>
          open ? setIsModalOpen(true) : handleCloseModal()
        }
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default AdminClient;
