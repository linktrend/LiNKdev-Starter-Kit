'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Sparkles } from 'lucide-react';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Step1CreateAccount } from '@/components/onboarding/Step1CreateAccount';
import { Step2CompleteProfile } from '@/components/onboarding/Step2CompleteProfile';
import { Step3Preferences } from '@/components/onboarding/Step3Preferences';
import { Step4Welcome } from '@/components/onboarding/Step4Welcome';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

interface OnboardingPageProps {
  params: { locale: string };
}

export default function OnboardingPage({ params: { locale } }: OnboardingPageProps) {
  const {
    currentStep,
    totalSteps,
    data,
    updateData,
    nextStep,
    prevStep,
  } = useOnboarding();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const seededRef = useRef(false);
  
  // Dev-mode: allow deep-link into step 2 with seeded auth data from query params
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const step = params?.get('step');
    const method = params?.get('method') as 'email' | 'phone' | 'social' | null;
    const email = params?.get('email') || undefined;
    const phone = params?.get('phone') || undefined;
    const provider = params?.get('provider') || undefined;

    if (step === '2' && currentStep === 1) {
      updateData({
        authMethod: method || undefined,
        email,
        phoneNumber: phone,
        acceptedTerms: true,
        socialProvider: provider,
      });

      if (method === 'email' && email) {
        toast({
          title: 'Magic link (dev)',
          description: `We would send a magic link to ${email}. Continuing onboarding...`,
        });
      } else if (method === 'phone' && phone) {
        toast({
          title: 'SMS code (dev)',
          description: `We would send an SMS code to ${phone}. Continuing onboarding...`,
        });
      } else if (method === 'social' && provider) {
        toast({
          title: 'Social sign-in (dev)',
          description: `Continuing with ${provider}.`,
        });
      }

      nextStep();
    }
  }, [currentStep, nextStep, toast, updateData]);
  
  const stepTitles = [
    'Create Account',
    'Complete Profile',
    'Set Preferences',
    'Welcome',
  ];

  const stepDescriptions = [
    'Sign in with your preferred method',
    'Tell us about yourself',
    'Customize your experience',
    'You\'re all set!',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pb-16 bg-background">
      <div className="w-full max-w-4xl mb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Welcome!</h1>
          </div>
          <p className="text-muted-foreground">Let&apos;s get you started</p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepTitle={stepTitles[currentStep - 1]}
        />

        {/* Main Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {stepTitles[currentStep - 1]}
            </CardTitle>
            <CardDescription>
              {stepDescriptions[currentStep - 1]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Create Account */}
            {currentStep === 1 && (
              <Step1CreateAccount
                data={data}
                updateData={updateData}
                onNext={nextStep}
              />
            )}

            {/* Step 2: Complete Profile */}
            {currentStep === 2 && (
              <Step2CompleteProfile
                data={data}
                updateData={updateData}
                onNext={nextStep}
                onBack={prevStep}
                onSkip={nextStep}
              />
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <Step3Preferences
                data={data}
                updateData={updateData}
                onNext={nextStep}
                onBack={prevStep}
                onSkip={nextStep}
              />
            )}

            {/* Step 4: Welcome */}
            {currentStep === 4 && (
              <Step4Welcome
                data={data}
                onBack={prevStep}
              />
                    )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
