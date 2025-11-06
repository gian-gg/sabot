'use client';

import { Mail, Flag, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProfileActionsProps {
  userId: string;
  userName: string;
  userEmail?: string;
}

export function ProfileActions({
  userId,
  userName,
  userEmail,
}: ProfileActionsProps) {
  const handleReport = () => {
    toast.info('Report feature coming soon');
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/user/${userId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userName}'s Profile on Sabot`,
          text: `Check out ${userName}'s profile on Sabot`,
          url: profileUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Could not share profile');
        }
      }
    } else {
      toast.error('Sharing not supported on this device');
    }
  };

  const contactEmail = userEmail || `contact-${userId}@sabot.example.com`;
  const mailtoLink = `mailto:${contactEmail}?subject=Contact from Sabot Platform`;

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:w-auto sm:justify-start">
      <Button asChild className="flex-1 gap-2 sm:flex-initial" size="default">
        <a href={mailtoLink}>
          <Mail className="h-4 w-4" />
          Contact
        </a>
      </Button>

      <Button
        onClick={handleShare}
        variant="outline"
        className="flex-1 gap-2 sm:flex-initial"
        size="default"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      <Button
        onClick={handleReport}
        variant="outline"
        className="text-destructive hover:text-destructive w-full gap-2 sm:w-auto"
        size="default"
      >
        <Flag className="h-4 w-4" />
        Report User
      </Button>
    </div>
  );
}
