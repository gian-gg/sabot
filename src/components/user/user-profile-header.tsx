'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils/helpers';
import {
  Activity,
  AlertCircle,
  ChevronRight,
  Copy,
  Crown,
  Mail,
  MoreHorizontal,
  QrCode,
  Share2,
  Shield,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserQRCode } from './user-qr-code';

interface UserProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role?: 'admin' | 'user';
    verificationStatus?: 'complete' | 'pending' | 'not-started';
  };
  isOwnProfile?: boolean;
}

export function UserProfileHeader({
  user,
  isOwnProfile = false,
}: UserProfileHeaderProps) {
  const getVerificationBadge = () => {
    switch (user.verificationStatus) {
      case 'complete':
        return (
          <Badge className="border-primary/50 bg-primary/20 text-primary gap-1.5">
            <Shield className="size-3" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge
            variant="secondary"
            className="gap-1.5 border-amber-500/50 bg-amber-500/20 text-amber-400"
          >
            <Activity className="size-3" />
            Pending Verification
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="gap-1.5 border-neutral-700 text-neutral-400"
          >
            <AlertCircle className="size-3" />
            Not Verified
          </Badge>
        );
    }
  };

  return (
    <Card className="relative overflow-hidden border-neutral-800 bg-neutral-900/50">
      {/* Subtle gradient glow effect */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2">
        <div className="bg-primary/10 absolute inset-0 rounded-full blur-3xl" />
      </div>

      <CardContent className="relative p-5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* User Info Section */}
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="size-24 border-2 border-neutral-700 sm:size-24">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {getInitials(user.name || 'U')}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Name and Meta */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  {user.name}
                </h1>
                {user.role === 'admin' && (
                  <Badge className="gap-1 border-amber-500/50 bg-amber-500/20 text-amber-400">
                    <Crown className="size-3" />
                    Admin
                  </Badge>
                )}
              </div>

              <div className="flex justify-center sm:justify-start">
                <a
                  href={`mailto:${user.email}`}
                  className="text-muted-foreground hover:text-primary group flex items-center gap-2 text-sm transition-colors hover:underline"
                >
                  {user.email}
                  <Mail className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 sm:justify-start">
                {getVerificationBadge()}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex w-full justify-center gap-2 sm:w-auto sm:justify-start sm:gap-3">
            {isOwnProfile && (
              <Button
                variant="outline"
                className="flex-1 border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 sm:flex-none"
                asChild
              >
                <Link href={ROUTES.WALLET}>
                  <Wallet className="mr-2 size-4" />
                  Wallet
                </Link>
              </Button>
            )}

            {/* Share / More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size={isOwnProfile ? 'icon' : 'default'}
                  className={cn(
                    'border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800',
                    isOwnProfile ? 'size-9 shrink-0' : 'flex-1 sm:flex-none'
                  )}
                >
                  {isOwnProfile ? (
                    <MoreHorizontal className="size-4" />
                  ) : (
                    <>
                      <Share2 className="mr-2 size-4" />
                      Share Profile
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border-neutral-800 bg-neutral-900"
              >
                <DropdownMenuItem
                  onClick={() => {
                    const url = `${window.location.origin}${ROUTES.USER.VIEW(user.id)}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Profile link copied');
                  }}
                  className="cursor-pointer focus:bg-neutral-800 focus:text-white"
                >
                  <Copy className="mr-2 size-4" />
                  Copy Profile Link
                </DropdownMenuItem>
                <UserQRCode user={user}>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer focus:bg-neutral-800 focus:text-white"
                  >
                    <QrCode className="mr-2 size-4" />
                    Show QR Code
                  </DropdownMenuItem>
                </UserQRCode>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
