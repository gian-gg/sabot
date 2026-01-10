'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Disclaimer } from '@/components/ui/disclaimer';
import { Button } from '@/components/ui/button';
import { ShieldCheck, FileText, Scan, Lock } from 'lucide-react';
import NavigationButtons from '../components/navigation-buttons';
import type { StepNavProps } from '@/types/verify';
import { useUserStore } from '@/store/user/userStore';
import { updateUserVerificationStatus } from '@/lib/supabase/db/user';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function PermissionConsent({ onNext }: StepNavProps) {
  const router = useRouter();
  const user = useUserStore();
  const [hasConsented, setHasConsented] = useState(false);

  const handleNext = () => {
    if (hasConsented) {
      onNext();
    }
  };

  // Update user verification status to 'complete'
  const handleSkipVerificationFlow = () => {
    updateUserVerificationStatus(user.id, 'complete')
      .then(() => {
        router.refresh();
      })
      .catch((error) => {
        toast.error('Failed to skip verification flow:', error);
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Consent</CardTitle>
        <CardDescription>
          Please review and accept the following terms to proceed with identity
          verification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>
            We take your privacy seriously. All information collected is used
            solely for identity verification purposes and is handled in
            accordance with our privacy policy.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <FileText className="text-muted-foreground mt-1 h-5 w-5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium">Government ID Upload</h4>
              <p className="text-muted-foreground text-sm">
                You will be asked to upload a clear photo of your
                government-issued ID (Passport, UMID, PhilSys, or Driver&apos;s
                License).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Scan className="text-muted-foreground mt-1 h-5 w-5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium">Facial Biometric Scan</h4>
              <p className="text-muted-foreground text-sm">
                We will capture your facial biometrics through your
                device&apos;s camera to verify that you match the photo on your
                ID.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Lock className="text-muted-foreground mt-1 h-5 w-5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium">Personal Information</h4>
              <p className="text-muted-foreground text-sm">
                You will need to provide personal details including your full
                name, date of birth, ID number, and address as shown on your
                government ID.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <h4 className="mb-2 text-sm font-medium">Data Usage & Privacy</h4>
          <ul className="text-muted-foreground space-y-1 text-sm">
            <li>
              • All information is collected exclusively for identity
              verification
            </li>
            <li>• Your data is encrypted and stored securely</li>
            <li>• We do not share your information with third parties</li>
            <li>• You can request deletion of your data at any time</li>
          </ul>
        </div>

        <Disclaimer variant="info" title="Project Disclosure">
          This is a submission to Lisk Builders Challenge. This prototype
          utilizes AI technology to streamline the implementation and
          development process, demonstrating rapid prototyping capabilities for
          identity verification systems.
        </Disclaimer>

        <div className="flex items-start space-x-3 p-4">
          <Checkbox
            id="consent"
            checked={hasConsented}
            onCheckedChange={(checked) => setHasConsented(checked === true)}
            className="border-primary mt-1"
          />
          <Label
            htmlFor="consent"
            className="cursor-pointer text-sm leading-relaxed"
          >
            I understand and consent to uploading my government-issued ID,
            providing personal information, and having my facial biometrics
            scanned for the sole purpose of identity verification. I acknowledge
            that this information will be handled securely and used only for
            verification purposes.
          </Label>
        </div>

        <NavigationButtons
          onNext={handleNext}
          isLoading={false}
          disableNext={!hasConsented}
        />

        {/* Hackathon judges shortcut */}
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              toast('Are you sure you want to skip verification?', {
                action: {
                  label: 'Skip',
                  onClick: handleSkipVerificationFlow,
                },
              });
            }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Skip permission consent (Hackathon Judges)"
          >
            Skip verification flow (for Hackathon Judges)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
