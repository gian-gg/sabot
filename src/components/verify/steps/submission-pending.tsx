import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SubmissionPending() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <Clock
        aria-hidden
        className="text-primary mx-auto mb-4 h-10 w-10 md:mb-6 md:h-12 md:w-12"
      />
      <h2 className="text-lg font-semibold md:text-xl">
        Verification in progress
      </h2>
      <p className="text-muted-foreground mt-2">
        We&apos;ve received your details and they&apos;re now being reviewed.
        This usually takes a few hours and can take up to a few days during busy
        times. You can safely close this page and check back later. We&apos;ll
        update your status on your Home page when it&apos;s ready.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/user">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
