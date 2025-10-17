// Agreement Progress Component
// Shows progress indicator for agreement creation/editing

interface AgreementProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function AgreementProgress({
  currentStep,
  totalSteps,
}: AgreementProgressProps) {
  // TODO: Replace with v0-generated component
  return (
    <div>
      <p>
        Progress: {currentStep} / {totalSteps}
      </p>
    </div>
  );
}
