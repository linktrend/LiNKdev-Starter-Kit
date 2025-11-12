'use client';

import { useState, useCallback } from 'react';

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface WorkExperienceEntry {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface OnboardingData {
  // Step 1 - Authentication
  authMethod?: 'social' | 'email' | 'phone';
  email?: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  acceptedTerms?: boolean;
  socialProvider?: string;
  
  // Step 2 - Profile
  username?: string;
  displayName?: string;
  personalTitle?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  personalAptSuite?: string;
  personalStreetAddress1?: string;
  personalStreetAddress2?: string;
  personalCity?: string;
  personalState?: string;
  personalPostalCode?: string;
  personalCountry?: string;
  bio?: string;
  education?: EducationEntry[];
  workExperience?: WorkExperienceEntry[];
  businessPosition?: string;
  businessCompany?: string;
  businessAptSuite?: string;
  businessStreetAddress1?: string;
  businessStreetAddress2?: string;
  businessCity?: string;
  businessState?: string;
  businessPostalCode?: string;
  businessCountry?: string;
  
  // Step 3 - Preferences
  language?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  emailNotifications?: {
    productUpdates?: boolean;
    securityAlerts?: boolean;
    marketing?: boolean;
    weeklyDigest?: boolean;
  };
  pushNotifications?: {
    importantUpdates?: boolean;
    newFeatures?: boolean;
    recommendations?: boolean;
  };
  inAppNotifications?: {
    systemAlerts?: boolean;
    activityUpdates?: boolean;
    suggestions?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  displayDensity?: 'comfortable' | 'compact' | 'spacious';
  allowAnalytics?: boolean;
  showProfile?: boolean;
  enableTwoFactor?: boolean;
  contactPreferences?: {
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
  };
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
    // Step 1 defaults
    email: '',
    phoneNumber: '',
    phoneCountryCode: '+1',
    acceptedTerms: false,
    authMethod: undefined,
    
    // Step 2 defaults
    username: '',
    displayName: '',
    personalTitle: 'Mr.',
    firstName: '',
    middleName: '',
    lastName: '',
    personalCountry: 'United States',
    businessCountry: 'United States',
    education: [],
    workExperience: [],
    
    // Step 3 defaults
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    emailNotifications: {
      productUpdates: true,
      securityAlerts: true,
      marketing: false,
      weeklyDigest: false,
    },
    pushNotifications: {
      importantUpdates: true,
      newFeatures: false,
      recommendations: false,
    },
    inAppNotifications: {
      systemAlerts: true,
      activityUpdates: true,
      suggestions: false,
    },
    theme: 'system',
    displayDensity: 'comfortable',
    allowAnalytics: true,
    showProfile: false,
    enableTwoFactor: false,
    contactPreferences: {
      email: true,
      sms: false,
      inApp: true,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 4; // Changed from 5 to 4

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
        // Must have auth method and accepted terms
        return !!(data.authMethod && data.acceptedTerms && (data.email || data.phoneNumber));
      case 2:
        // Must have required profile fields
        return !!(
          data.username && 
          data.displayName && 
          data.firstName && 
          data.lastName && 
          (data.email || data.phoneNumber)
        );
      case 3:
        // Preferences are optional, always allow next
        return true;
      case 4:
        // Final step, always allow
        return true;
      default:
        return false;
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
