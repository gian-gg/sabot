import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgreementProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function AgreementProgress({
  currentStep,
  totalSteps,
}: AgreementProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
              step < currentStep &&
                'border-primary bg-primary text-primary-foreground',
              step === currentStep &&
                'border-primary bg-background text-primary',
              step > currentStep &&
                'border-muted bg-background text-muted-foreground'
            )}
          >
            {step < currentStep ? (
              <Check className="h-5 w-5" />
            ) : (
              <span className="font-semibold">{step}</span>
            )}
          </div>
          {step < totalSteps && (
            <div
              className={cn(
                'h-0.5 w-12 transition-all',
                step < currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
