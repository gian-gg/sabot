import { Spinner } from '@/components/ui/spinner';

export function SubmissionPending() {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      <Spinner className="text-primary mx-auto mb-4 size-10 md:mb-6 md:size-12" />
      <h2 className="text-lg font-semibold md:text-xl">
        Verification in Progress
      </h2>
      <p className="text-muted-foreground mt-2">
        This should take 1-2 minutes. We&apos;ll notify you once it&apos;s
        complete.
      </p>
    </div>
  );
}
