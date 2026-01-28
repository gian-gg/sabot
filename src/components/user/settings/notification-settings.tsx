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
import { Bell } from 'lucide-react';

export function NotificationSettings() {
  return (
    <Card className="border-neutral-800 bg-neutral-900/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="text-primary h-5 w-5" />
          <CardTitle className="text-white">Notification Settings</CardTitle>
        </div>
        <CardDescription className="text-neutral-400">
          Control how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications" className="text-neutral-300">
              Email Notifications
            </Label>
            <p className="text-sm text-neutral-500">
              Receive email updates about your transactions
            </p>
          </div>
          <Switch id="email-notifications" disabled />
        </div>

        <Separator className="bg-neutral-800" />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="transaction-alerts" className="text-neutral-300">
              Transaction Alerts
            </Label>
            <p className="text-sm text-neutral-500">
              Get notified about transaction status changes
            </p>
          </div>
          <Switch id="transaction-alerts" disabled />
        </div>

        <Separator className="bg-neutral-800" />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="escrow-updates" className="text-neutral-300">
              Escrow Updates
            </Label>
            <p className="text-sm text-neutral-500">
              Notifications for escrow confirmations and releases
            </p>
          </div>
          <Switch id="escrow-updates" disabled />
        </div>
      </CardContent>
    </Card>
  );
}
