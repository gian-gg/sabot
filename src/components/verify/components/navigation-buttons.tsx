import React from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import type { StepNavProps } from '@/types/verify';

type NavigationButtonsProps = Omit<StepNavProps, 'onPrev'> & {
  onPrev?: StepNavProps['onPrev'];
  isLoading: boolean;
  disableNext?: boolean;
};

const NavigationButtons = ({
  onNext,
  onPrev,
  isLoading,
  disableNext = false,
}: NavigationButtonsProps) => {
  return (
    <div className={`flex ${onPrev ? 'justify-between' : 'justify-end'} mt-4`}>
      {onPrev && (
        <Button
          variant="outline"
          onClick={onPrev}
          className="transition-all duration-150 active:scale-[0.98]"
          disabled={isLoading}
        >
          Back
        </Button>
      )}
      <Button
        onClick={onNext}
        className="transition-all duration-150 active:scale-[0.98]"
        disabled={isLoading || disableNext}
      >
        {isLoading ? <Spinner className="mr-2" /> : null}
        Continue
      </Button>
    </div>
  );
};

export default NavigationButtons;
