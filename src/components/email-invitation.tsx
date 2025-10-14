import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, SendHorizontal } from 'lucide-react';

export default function EmailInvitationDialog({
  open,
  setOpen,
  email,
  setEmail,
  sending,
  handleSendInvitation,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  email: string;
  setEmail: (email: string) => void;
  sending: boolean;
  handleSendInvitation: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Email Invitation</DialogTitle>
          <DialogDescription>
            Enter your counterparty&apos;s email address to send them a secure
            transaction invitation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative w-full">
              <Input
                id="email"
                type="email"
                placeholder="buyer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !sending) {
                    handleSendInvitation();
                  }
                }}
                className="pr-10"
              />
              <button
                type="button"
                disabled={sending || !email}
                onClick={handleSendInvitation}
                className="hover:bg-accent absolute top-1/2 right-1 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md transition-colors"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizontal className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
