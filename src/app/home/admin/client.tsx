'use client';

import React, { useState } from 'react';
import { useUserStore } from '@/store/user/userStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Users,
} from 'lucide-react';
import { idOptions } from '@/constants/verify';
import type { IdType } from '@/types/verify';
import Denied from '@/components/admin/denied';

import type { VerificationRequests } from '@/types/verify';

const AdminClient = ({ requests }: { requests: VerificationRequests[] }) => {
  const user = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (user.role !== 'admin') {
    return <Denied />;
  }

  // Handle case when requests is undefined or null
  const safeRequests = requests || [];

  const filteredRequests = safeRequests.filter((req) => {
    const matchesSearch =
      req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: safeRequests.length,
    pending: safeRequests.filter((r) => r.status === 'pending').length,
    approved: safeRequests.filter((r) => r.status === 'complete').length,
    rejected: safeRequests.filter((r) => r.status === 'not-started').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="border-yellow-500/50 text-yellow-500"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'complete':
        return (
          <Badge variant="outline" className="border-primary text-primary">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'not-started':
        return (
          <Badge
            variant="outline"
            className="border-destructive text-destructive"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getIdTypeLabel = (idType: IdType) => {
    return idOptions.find((opt) => opt.id === idType)?.label || idType;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground text-xs">
              All verification submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-muted-foreground text-xs">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-muted-foreground text-xs">Verified users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="text-destructive h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-muted-foreground text-xs">Failed verification</p>
          </CardContent>
        </Card>
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
          <div className="overflow-hidden rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      ID Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Face Match
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center">
                        <p className="text-muted-foreground">
                          No verification requests found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {request.userName}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {request.userEmail}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">
                            {getIdTypeLabel(
                              request.governmentIdInfo.idType || 'passport'
                            )}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {request.faceMathchConfidence !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
                                <div
                                  className={`h-full ${
                                    request.faceMathchConfidence >= 0.85
                                      ? 'bg-primary'
                                      : request.faceMathchConfidence >= 0.7
                                        ? 'bg-yellow-500'
                                        : 'bg-destructive'
                                  }`}
                                  style={{
                                    width: `${request.faceMathchConfidence * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs">
                                {(request.faceMathchConfidence * 100).toFixed(
                                  0
                                )}
                                %
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button size="sm" className="h-8 gap-1 text-xs">
                              <Eye className="h-3 w-3" />
                              Review
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminClient;
