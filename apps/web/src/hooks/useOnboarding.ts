'use client';

import { useState, useCallback } from 'react';

export interface OnboardingData {
  email?: string;
  phoneNumber?: string;
  acceptedTerms?: boolean;
  name?: string;
  role?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    inapp?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
}

export interface UseOnboardingReturn {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: () => boolean;
  isLoading: boolean;
}

export function useOnboarding(): UseOnboardingReturn {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    email: '',
    phoneNumber: '',
    acceptedTerms: false,
    name: '',
    role: '',
    notifications: {
      email: false,
      push: false,
      inapp: false,
    },
    theme: 'system',
  });
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 5;

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 1:
        return !!(data.email || data.phoneNumber) && data.acceptedTerms;
      case 2:
        return !!data.name;
      case 3:
        return !!data.role;
      case 4:
        return true;
      default:
        return true;
    }
  }, [currentStep, data]);

  return {
    currentStep,
    totalSteps,
    data,
    updateData,
    nextStep,
    prevStep,
    canGoNext,
    isLoading,
  };
}
