'use client';

import { Button } from '@/components/ui/button';
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
import { Lock, Shield } from 'lucide-react';

export function SecuritySettings() {
  return (
    <Card className="border-neutral-800 bg-neutral-900/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="text-primary h-5 w-5" />
          <CardTitle className="text-white">Security Settings</CardTitle>
        </div>
        <CardDescription className="text-neutral-400">
          Manage your account security and authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-neutral-300">Password</Label>
          <Button variant="outline" disabled className="border-neutral-700">
            <Lock className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        </div>

        <Separator className="bg-neutral-800" />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="two-factor" className="text-neutral-300">
              Two-Factor Authentication
            </Label>
            <p className="text-sm text-neutral-500">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch id="two-factor" disabled />
        </div>
      </CardContent>
    </Card>
  );
}
