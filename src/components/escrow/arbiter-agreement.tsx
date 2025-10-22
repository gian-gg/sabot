'use client';

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Shield,
    CheckCircle2,
    XCircle,
    Clock,
    Users,
    Star,
    AlertCircle,
    Info,
} from 'lucide-react';

interface Arbiter {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    rating: number;
    completedDisputes: number;
    specialties: string[];
    responseTime: string;
    fee: string;
}

interface ArbiterAgreementProps {
    arbiter: Arbiter;
    onApprove: () => void;
    onReject: () => void;
    isApproved: boolean;
    isRejected: boolean;
    isPending: boolean;
    proposerName: string;
    disabled?: boolean;
}

export function ArbiterAgreement({
    arbiter,
    onApprove,
    onReject,
    isApproved,
    isRejected,
    isPending,
    proposerName,
    disabled = false,
}: ArbiterAgreementProps) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900">
                    <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Arbiter Agreement Required</h3>
                    <p className="text-sm text-muted-foreground">
                        {proposerName} has proposed an arbiter for this escrow
                    </p>
                </div>
            </div>

            {/* Arbiter Card */}
            <Card className={`transition-colors ${isApproved ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' :
                    isRejected ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950' :
                        'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
                }`}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={arbiter.avatar} />
                                <AvatarFallback>
                                    {arbiter.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">{arbiter.name}</CardTitle>
                                <CardDescription>{arbiter.email}</CardDescription>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-orange-600">{arbiter.fee}</p>
                            <p className="text-xs text-muted-foreground">Fee</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        {isApproved && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Approved
                            </Badge>
                        )}
                        {isRejected && (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejected
                            </Badge>
                        )}
                        {isPending && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending Your Decision
                            </Badge>
                        )}
                    </div>

                    {/* Arbiter Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="flex items-center justify-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{arbiter.rating}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Rating</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-1 text-sm">
                                <Users className="h-4 w-4" />
                                <span className="font-medium">{arbiter.completedDisputes}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Disputes</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-1 text-sm">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">{arbiter.responseTime}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Response</p>
                        </div>
                    </div>

                    {/* Specialties */}
                    <div>
                        <p className="text-sm font-medium mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-1">
                            {arbiter.specialties.map((specialty) => (
                                <Badge key={specialty} variant="outline" className="text-xs">
                                    {specialty}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isPending && (
                        <div className="flex gap-2 pt-4 border-t">
                            <Button
                                onClick={onApprove}
                                disabled={disabled}
                                className="flex-1"
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approve Arbiter
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onReject}
                                disabled={disabled}
                                className="flex-1"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                            </Button>
                        </div>
                    )}

                    {/* Approved/Rejected Actions */}
                    {(isApproved || isRejected) && (
                        <div className="pt-4 border-t">
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    {isApproved
                                        ? "You have approved this arbiter. The arbiter will be notified and can now oversee this escrow."
                                        : "You have rejected this arbiter. The other party will need to propose a different arbiter."
                                    }
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Agreement Notice */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Important:</strong> Once you approve this arbiter, they will have the authority to resolve any disputes in this escrow.
                    The arbiter's decision is final and cannot be appealed.
                </AlertDescription>
            </Alert>
        </div>
    );
}
