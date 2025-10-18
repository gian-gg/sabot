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
import type { IdType } from '@/types/verify';

export function IdSelection({
  onNext,
  selectedIDType,
  setSelectedIDType,
}: StepNavProps & {
  selectedIDType: IdType | null;
  setSelectedIDType: (id: IdType | null) => void;
}) {
  const currentValue = selectedIDType ?? idOptions[0].id;

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
          onValueChange={(val) => setSelectedIDType(val as IdType)}
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
        <NavigationButtons
          onNext={() => {
            if (!selectedIDType) {
              setSelectedIDType(idOptions[0].id);
            }
            onNext();
          }}
          isUploading={false}
        />
      </CardContent>
    </Card>
  );
}
