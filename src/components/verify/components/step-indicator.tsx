import React from 'react';

import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const columns = Array.from({ length: steps.length * 2 - 1 }, (_, i) =>
    i % 2 === 0 ? 'auto' : '1fr'
  ).join(' ');

  return (
    <div
      className="grid items-center justify-center gap-x-2 md:gap-x-3"
      style={{ gridTemplateColumns: columns } as React.CSSProperties}
    >
      {steps.map((step, index) => {
        const nodeCol = index * 2 + 1;
        const done = index < currentStep;
        const active = index === currentStep;
        return (
          <React.Fragment key={step}>
            <div
              className="flex items-center justify-center"
              style={{ gridColumn: nodeCol, gridRow: 1 } as React.CSSProperties}
            >
              <div
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'text-primary-foreground flex size-6 items-center justify-center rounded-full font-semibold transition-all duration-300 ease-out md:size-8',
                  done && 'bg-primary',
                  active && 'bg-primary ring-primary/20 scale-105 ring-4',
                  !done && !active && 'bg-muted text-muted-foreground'
                )}
              >
                {done ? '✓' : index + 1}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                aria-hidden
                className={cn(
                  'h-0.5 w-full rounded-full transition-all duration-300 ease-out md:h-1',
                  index < currentStep ? 'bg-primary' : 'bg-muted'
                )}
                style={
                  { gridColumn: nodeCol + 1, gridRow: 1 } as React.CSSProperties
                }
              />
            )}

            <div
              className="hidden items-start justify-center sm:flex"
              style={{ gridColumn: nodeCol, gridRow: 2 } as React.CSSProperties}
            >
              <p
                className={cn(
                  'mt-1 text-center text-[10px] font-medium transition-colors duration-300 md:mt-2 md:text-sm',
                  index <= currentStep
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {step}
              </p>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
