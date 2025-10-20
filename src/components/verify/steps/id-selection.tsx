import { useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import NavigationButtons from '../components/navigation-buttons';

import type { StepNavProps } from '@/types/verify';
import { idOptions } from '@/constants/verify';
import type { IdType, UserIDType } from '@/types/verify';

export function IdSelection({
  onNext,
  selectedIDType,
  setSelectedIDType,
}: StepNavProps & {
  selectedIDType: UserIDType | null;
  setSelectedIDType: (arg: UserIDType | null) => void;
}) {
  const currentValue = useMemo(
    () => selectedIDType?.type ?? idOptions[0].id,
    [selectedIDType]
  );

  const handleNext = useCallback(() => {
    if (!selectedIDType) {
      setSelectedIDType({ type: idOptions[0].id, file: null });
    }
    onNext();
  }, [selectedIDType, setSelectedIDType, onNext]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select your ID</CardTitle>
        <CardDescription>
          Please choose a valid, government-issued photo ID to verify your
          identity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={currentValue}
          onValueChange={(val) =>
            setSelectedIDType({ type: val as IdType, file: null })
          }
          className="gap-4"
        >
          {idOptions.map((option) => (
            <Label
              key={option.id}
              htmlFor={option.id}
              className="hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary flex items-center space-x-4 rounded-md border p-4"
            >
              <RadioGroupItem value={option.id} id={option.id} />
              <span>{option.label}</span>
            </Label>
          ))}
        </RadioGroup>
        <NavigationButtons onNext={handleNext} isLoading={false} />
      </CardContent>
    </Card>
  );
}
