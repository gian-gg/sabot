'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
    CheckCircle,
    Clock,
    Package,
    Bot,
    FileText,
    DollarSign,
    User,
    Upload,
    Download,
    AlertCircle,
    Star,
} from 'lucide-react';

interface DeliverableStatusProps {
    id: string;
    name: string;
    description: string;
    party: 'initiator' | 'participant';
    status: 'pending' | 'in_progress' | 'completed' | 'verified' | 'failed';
    progress: number;
    submittedAt?: string;
    verifiedAt?: string;
    oracleType?: 'ipfs' | 'ai' | 'manual';
    confidence?: number;
    notes?: string;
    partyName: string;
    onAction?: (action: 'submit' | 'verify' | 'approve' | 'reject') => void;
    disabled?: boolean;
}

const statusConfig = {
    pending: {
        icon: Package,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        label: 'Pending',
        description: 'Waiting to be submitted',
    },
    in_progress: {
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: 'In Progress',
        description: 'Currently being processed',
    },
    completed: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Completed',
        description: 'Successfully completed',
    },
    verified: {
        icon: Star,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        label: 'Verified',
        description: 'Oracle verified',
    },
    failed: {
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'Failed',
        description: 'Verification failed',
    },
};

const oracleTypeConfig = {
    ipfs: {
        icon: FileText,
        label: 'IPFS',
        description: 'File verification',
    },
    ai: {
        icon: Bot,
        label: 'AI',
        description: 'AI verification',
    },
    manual: {
        icon: User,
        label: 'Manual',
        description: 'Manual review',
    },
};

export function DeliverableStatus({
    id,
    name,
    description,
    party,
    status,
    progress,
    submittedAt,
    verifiedAt,
    oracleType,
    confidence,
    notes,
    partyName,
    onAction,
    disabled = false,
}: DeliverableStatusProps) {
    const config = statusConfig[status];
    const oracleConfig = oracleType ? oracleTypeConfig[oracleType] : null;
    const StatusIcon = config.icon;

    const getCardStyles = () => {
        switch (status) {
            case 'completed':
            case 'verified':
                return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
            case 'in_progress':
                return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
            case 'failed':
                return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
            default:
                return 'border-gray-200 dark:border-gray-800';
        }
    };

    return (
        <Card className={`transition-colors ${getCardStyles()}`}>
            <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor} ${config.color}`}>
                            <StatusIcon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-medium">{name}</h4>
                                <Badge variant="outline" className="text-xs">
                                    {party === 'initiator' ? 'Initiator' : 'Participant'}
                                </Badge>
                                {oracleConfig && (
                                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                        <oracleConfig.icon className="h-3 w-3" />
                                        {oracleConfig.label}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{partyName}</span>
                                </div>
                                {submittedAt && (
                                    <div className="flex items-center gap-1">
                                        <Upload className="h-3 w-3" />
                                        <span>Submitted {new Date(submittedAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {verifiedAt && (
                                    <div className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        <span>Verified {new Date(verifiedAt).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-medium">{config.label}</div>
                        {confidence && (
                            <div className="text-xs text-muted-foreground">
                                {confidence}% confidence
                            </div>
                        )}
                        {notes && (
                            <div className="text-xs text-muted-foreground mt-1 max-w-32 truncate">
                                {notes}
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                </div>

                {/* Action Buttons */}
                {onAction && status === 'pending' && (
                    <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => onAction('submit')}
                                disabled={disabled}
                                className="flex-1"
                            >
                                <Upload className="h-3 w-3 mr-1" />
                                Submit
                            </Button>
                        </div>
                    </div>
                )}

                {onAction && status === 'completed' && (
                    <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onAction('verify')}
                                disabled={disabled}
                                className="flex-1"
                            >
                                <Star className="h-3 w-3 mr-1" />
                                Verify
                            </Button>
                        </div>
                    </div>
                )}

                {onAction && status === 'verified' && (
                    <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => onAction('approve')}
                                disabled={disabled}
                                className="flex-1"
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onAction('reject')}
                                disabled={disabled}
                                className="flex-1"
                            >
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Reject
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
