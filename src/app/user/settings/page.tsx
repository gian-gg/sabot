'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DangerZone } from '@/components/user/settings/danger-zone';
import { NotificationSettings } from '@/components/user/settings/notification-settings';
import { PrivacySettings } from '@/components/user/settings/privacy-settings';
import { ProfileSettings } from '@/components/user/settings/profile-settings';
import { SecuritySettings } from '@/components/user/settings/security-settings';
import { ROUTES } from '@/constants/routes';
import { ChevronLeft, Info } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-4">
        <Link href={ROUTES.USER.ROOT} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="text-lg text-neutral-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Prototype Disclaimer */}
      <Alert className="border-yellow-900/50 bg-yellow-950/20 text-yellow-200">
        <Info className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-500">
          Prototype Disclaimer
        </AlertTitle>
        <AlertDescription className="text-yellow-200/80">
          Most settings and preferences shown here are for demonstration
          purposes. Profile updates and other features are coming soon.
        </AlertDescription>
      </Alert>

      <Separator className="bg-neutral-800" />

      {/* Profile Settings */}
      <ProfileSettings />

      {/* Notification Settings */}
      <NotificationSettings />

      {/* Privacy Settings */}
      <PrivacySettings />

      {/* Security Settings */}
      <SecuritySettings />

      {/* Danger Zone */}
      <DangerZone />
    </div>
  );
}
