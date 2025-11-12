interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
}

export function ProgressBar({ currentStep, totalSteps, stepTitle }: ProgressBarProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep} of {totalSteps}: {stepTitle}
        </span>
        <span className="text-sm text-muted-foreground">
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

