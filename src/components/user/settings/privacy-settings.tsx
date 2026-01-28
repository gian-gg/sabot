'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Eye } from 'lucide-react';

export function PrivacySettings() {
  return (
    <Card className="border-neutral-800 bg-neutral-900/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Eye className="text-primary h-5 w-5" />
          <CardTitle className="text-white">Privacy Settings</CardTitle>
        </div>
        <CardDescription className="text-neutral-400">
          Control your data and visibility preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="profile-visibility" className="text-neutral-300">
              Profile Visibility
            </Label>
            <p className="text-sm text-neutral-500">
              Allow other users to view your profile
            </p>
          </div>
          <Switch id="profile-visibility" disabled />
        </div>

        <Separator className="bg-neutral-800" />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="transaction-history" className="text-neutral-300">
              Transaction History Visibility
            </Label>
            <p className="text-sm text-neutral-500">
              Show transaction count on your profile
            </p>
          </div>
          <Switch id="transaction-history" disabled />
        </div>
      </CardContent>
    </Card>
  );
}
