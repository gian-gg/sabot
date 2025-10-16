import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

import type { StepNavProps } from '../../../types/verify';

type IdSelectionProps = StepNavProps;

const idOptions = [
  { id: 'passport', label: 'Passport' },
  { id: 'umid', label: 'UMID' },
  { id: 'philsys', label: 'PhilSys ID' },
  { id: 'drivers_license', label: "Driver's License" },
];

export function IdSelection({ onNext }: IdSelectionProps) {
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
        <RadioGroup defaultValue={idOptions[0].id} className="gap-4">
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
        <Button
          onClick={onNext}
          className="mt-6 w-full transition-all duration-150 active:scale-[0.98]"
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}
