import React from 'react';
import { Button } from '@/components/ui/button';

import type { StepNavProps } from '@/types/verify';

type NavigationButtonsProps = Omit<StepNavProps, 'onPrev'> & {
  onPrev?: StepNavProps['onPrev'];
  isUploading: boolean;
};

const NavigationButtons = ({
  onNext,
  onPrev,
  isUploading,
}: NavigationButtonsProps) => {
  return (
    <div className={`flex ${onPrev ? 'justify-between' : 'justify-end'}`}>
      {onPrev && (
        <Button
          variant="outline"
          onClick={onPrev}
          className="transition-all duration-150 active:scale-[0.98]"
          disabled={isUploading}
        >
          Back
        </Button>
      )}
      <Button
        onClick={onNext}
        className="transition-all duration-150 active:scale-[0.98]"
        disabled={isUploading}
      >
        Continue
      </Button>
    </div>
  );
};

export default NavigationButtons;
