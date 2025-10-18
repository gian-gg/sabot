import React from 'react';
import { Button } from '@/components/ui/button';

import type { StepNavProps } from '@/types/verify';

const NavigationButtons = ({
  onNext,
  onPrev,
  isUploading,
}: StepNavProps & { isUploading: boolean }) => {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrev}
        className="transition-all duration-150 active:scale-[0.98]"
        disabled={isUploading}
      >
        Back
      </Button>
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
