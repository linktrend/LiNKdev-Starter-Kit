'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * OnboardingProgress component displays a visual progress indicator for multi-step onboarding
 * @param currentStep - The current active step (1-indexed)
 * @param totalSteps - Total number of steps in the onboarding process
 */
export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <div className="relative">
        {/* Progress bar background */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-muted rounded-full">
          {/* Progress bar fill */}
          <div
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            const isUpcoming = step > currentStep;

            return (
              <div
                key={step}
                className="flex flex-col items-center"
              >
                {/* Circle with number or checkmark */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isUpcoming && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>

                {/* Step label */}
                <div
                  className={cn(
                    'mt-2 text-xs font-medium transition-colors',
                    (isCompleted || isCurrent) && 'text-foreground',
                    isUpcoming && 'text-muted-foreground'
                  )}
                >
                  Step {step}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
