import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function ReviewInvitationStep({
  inviterEmail,
  onDecline,
  onAccept,
}: {
  inviterEmail: string;
  onDecline: () => void;
  onAccept: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
        <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
        <div>
          <p className="mb-1 text-sm font-medium text-blue-300">
            Invitation from {inviterEmail}
          </p>
          <p className="text-xs text-blue-400/70">
            They have uploaded their conversation screenshot and are waiting for
            you to verify the transaction
          </p>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-white">
          What happens next?
        </h3>
        <div className="border-border bg-muted/50 space-y-3 rounded-lg border p-4">
          {/* ...existing code for steps 1, 2, 3... */}
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/20 text-xs font-semibold text-blue-400">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Upload your conversation screenshot
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                This will be cross-referenced with the other party&apos;s upload
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-1 border-purple-400/30 bg-purple-500/20 text-xs font-semibold text-purple-400">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                AI verifies authenticity
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Our system detects inconsistencies and fraud attempts
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-green-400/30 bg-green-500/20 text-xs font-semibold text-green-400">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                Review transaction summary
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Proceed with a safe, verified transaction
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1 border-neutral-700 text-neutral-300 hover:bg-white/5"
          onClick={onDecline}
        >
          Decline
        </Button>
        <Button
          className="flex-1 bg-white text-black hover:bg-neutral-200"
          onClick={onAccept}
        >
          Accept & Continue
        </Button>
      </div>
    </div>
  );
}
