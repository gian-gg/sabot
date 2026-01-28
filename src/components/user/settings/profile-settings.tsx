'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProfilePicture } from '@/components/user/settings/profile-picture';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUserStore } from '@/store/user/userStore';
import { CheckCircle, Copy, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
// import { updateUserDisplayName } from '@/lib/supabase/db/profile';

export function ProfileSettings() {
  const { name, email, id, image } = useUserStore();
  const [fullName, setFullName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Update local state when user data is loaded
  useEffect(() => {
    if (name) setFullName(name);
  }, [name]);

  const handleSaveName = async () => {
    if (!fullName || !id) return;

    // Feature disabled for now
    toast.info('Display name update is coming soon!');

    // setIsUpdating(true);
    // try {
    //   const { success, error } = await updateUserDisplayName(id, fullName);
    //
    //   if (success) {
    //     toast.success('Display name updated successfully');
    //   } else {
    //     toast.error(error || 'Failed to update display name');
    //   }
    // } catch (error) {
    //   toast.error('An unexpected error occurred');
    // } finally {
    //   setIsUpdating(false);
    // }
  };

  return (
    <Card className="border-neutral-800 bg-neutral-900/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserIcon className="text-primary h-5 w-5" />
          <CardTitle className="text-white">Profile Settings</CardTitle>
        </div>
        <CardDescription className="text-neutral-400">
          Update your display name and view account information (Coming Soon)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture and Display Name - Enhanced Layout */}
        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          {/* Profile Picture */}
          {/* Profile Picture */}
          <ProfilePicture image={image} name={name} />

          {/* Full Name - Enhanced */}
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-neutral-300"
              >
                Full Name
              </Label>
              <div className="flex gap-2">
                <Input
                  id="name"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="focus:border-primary/50 focus:ring-primary/20 border-neutral-700 bg-neutral-900/80 text-white placeholder:text-neutral-500"
                />
                <Button
                  variant="outline"
                  onClick={handleSaveName}
                  disabled={!fullName || fullName === name || isUpdating}
                  className="hover:border-primary/50 hover:bg-primary/10 border-neutral-700"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </Button>
              </div>
              <p className="text-xs text-neutral-500">
                This is your public full name visible to other users
              </p>
            </div>

            {/* User ID - Single Line */}
            <div
              className="group flex w-fit cursor-pointer items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
              onClick={() => {
                if (id) {
                  navigator.clipboard.writeText(id);
                  toast.success('User ID copied to clipboard');
                }
              }}
            >
              <span className="font-medium">User ID</span>
              <span className="font-mono text-neutral-500 transition-colors group-hover:text-neutral-300">
                {id || 'Loading...'}
              </span>
              <Copy className="ml-1 h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
        </div>

        <Separator className="bg-neutral-800" />

        {/* Email - Enhanced with Gradient Container */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-neutral-300">
            Connected Account
          </Label>
          <div className="border-primary/30 from-primary/10 via-primary/5 relative w-full overflow-hidden rounded-xl border bg-gradient-to-r to-transparent p-4">
            {/* Subtle glow effect */}
            <div className="bg-primary/20 pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl" />

            <div className="relative flex items-center gap-4">
              {/* Google Logo */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white shadow-md">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>

              {/* Email Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-white">
                    {email || 'Loading...'}
                  </p>
                  <span className="bg-primary text-primary-foreground flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium shadow-sm">
                    <CheckCircle className="h-3 w-3" />
                    Connected
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-400">
                  Authenticated via Google OAuth
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
