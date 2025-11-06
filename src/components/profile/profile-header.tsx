import { Shield, Calendar, CheckCircle2 } from 'lucide-react';
import { UserAvatar } from '../user/user-avatar';
import type { PublicUserProfile } from '@/types/profile';

interface ProfileHeaderProps {
  profile: PublicUserProfile;
  showTrustScore?: boolean; // Only visible to potential transaction partners
}

export function ProfileHeader({
  profile,
  showTrustScore = true,
}: ProfileHeaderProps) {
  const { name, avatar, isVerified, stats, memberSince } = profile;

  return (
    <div className="border-border bg-card/50 relative overflow-hidden rounded-xl border backdrop-blur-sm">
      {/* Background Gradient */}
      <div className="from-primary/10 via-primary/5 absolute inset-0 bg-linear-to-br to-transparent" />

      {/* Content */}
      <div className="relative p-4 sm:p-6 md:p-8">
        {/* Top Row: Avatar, Name & Trust Score */}
        <div className="flex flex-col items-center gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: Avatar & Name */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 lg:flex-row lg:items-start">
            {/* Avatar */}
            <div className="relative">
              <UserAvatar
                name={name}
                avatar={avatar}
                size="xl"
                className="ring-primary/20 ring-4"
              />
              {isVerified && (
                <div className="bg-primary border-card absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 sm:h-8 sm:w-8 sm:border-4">
                  <CheckCircle2 className="text-primary-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
              )}
            </div>

            {/* Name & Info */}
            <div className="flex-1 space-y-2 text-center sm:space-y-3 lg:text-left">
              <h1 className="text-foreground text-xl font-bold sm:text-2xl md:text-3xl">
                {name}
              </h1>
              <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs sm:text-sm lg:justify-start">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>

          {/* Right: Trust Score */}
          {showTrustScore && (
            <div className="border-primary/30 bg-primary/5 flex w-full flex-col items-center gap-2 rounded-lg border px-6 py-3 backdrop-blur-sm sm:w-auto sm:px-8 sm:py-4">
              <div className="flex items-center gap-2">
                <Shield className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs">
                  Trust Score
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-primary text-4xl font-bold sm:text-5xl">
                  {stats.trustScore}
                </span>
                <span className="text-primary/70 text-xl font-semibold sm:text-2xl">
                  %
                </span>
              </div>
              <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full sm:h-2">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.trustScore}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
