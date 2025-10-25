'use client';

import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function GasFeeWarningDialog() {
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);

  useEffect(() => {
    // Check if user has seen this dialog before
    const hasSeenGasFeeWarning = localStorage.getItem('hasSeenGasFeeWarning');

    if (!hasSeenGasFeeWarning) {
      // Show dialog after a brief delay for better UX
      const timer = setTimeout(() => {
        setOpen(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (!understood) return;
    // Mark as seen in localStorage
    localStorage.setItem('hasSeenGasFeeWarning', 'true');
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-left">
              Gas Fees & Token Information
            </AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        <div className="space-y-5">
          {/* Main explanation */}
          <div className="text-muted-foreground text-sm leading-relaxed">
            Blockchain transactions require{' '}
            <strong className="text-foreground">ETH</strong> for gas fees. Sabot
            operates using <strong className="text-primary">$SABOT</strong>{' '}
            tokens on Lisk L2 (built on Ethereum).
          </div>

          {/* Onboarding Benefits - Full Width */}
          <div className="bg-muted/50 space-y-3 rounded-lg border p-5">
            <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <div className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded">
                <span className="text-xs">✓</span>
              </div>
              Onboarding Benefits
            </div>
            <ul className="text-muted-foreground grid gap-2 text-xs sm:grid-cols-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  Receive <strong className="text-foreground">$SBT</strong>{' '}
                  tokens upon joining the platform
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  Verified users get{' '}
                  <strong className="text-foreground">ETH</strong> for gas fees
                  automatically
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Access to secure escrow and agreement features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>
                  Blockchain-verified transaction history and reputation
                </span>
              </li>
            </ul>
          </div>
        </div>

        <AlertDialogFooter className="flex-col gap-4 sm:flex-col">
          <div className="bg-destructive/10 border-destructive/20 flex w-full items-center gap-2 rounded-lg border px-4 py-3 text-xs">
            <span className="text-muted-foreground">
              Verification is manual and may take time. ETH will automatically
              be sent
            </span>
          </div>

          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="understand"
                checked={understood}
                onCheckedChange={(checked) => setUnderstood(checked === true)}
                className="h-5 w-5"
              />
              <Label
                htmlFor="understand"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I understand the gas fee requirements
              </Label>
            </div>
            <Button
              onClick={handleClose}
              disabled={!understood}
              className="shrink-0"
              size="lg"
            >
              Continue
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
