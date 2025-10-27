'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useOnboarding, ONBOARDING_STEPS, type OnboardingData } from '@/hooks/useOnboarding';
import { signUp } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, User, Settings, Globe, Bell, Shield, Sparkles } from 'lucide-react';
import { LOCALE_OPTIONS, NOTIFICATION_OPTIONS, PRIVACY_VISIBILITY_OPTIONS } from '@/lib/mocks/onboarding';

export default function SignUp() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    currentStep,
    totalSteps,
    data,
    nextStep,
    prevStep,
    updateStepData,
    validateCurrentStep,
    submit,
  } = useOnboarding();

  const handleStepSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (currentStep === 0) {
      // Handle account creation (Step 1)
      setIsSubmitting(true);
      await handleRequest(e, signUp, router);
      setIsSubmitting(false);
    } else if (currentStep === totalSteps - 1) {
      // Handle final submission
      await submit();
      router.push('/');
    } else {
      // Move to next step
      nextStep();
    }
  };

  const handleInputChange = (field: string, value: string | boolean | object) => {
    const stepKey = ONBOARDING_STEPS[currentStep].id as keyof OnboardingData;
    updateStepData(stepKey, { [field]: value });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Account Creation
        return (
          <form onSubmit={handleStepSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={data.account?.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={data.account?.email || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={data.account?.password || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <span>Sign up with email and password</span>
            </div>
            
            <Separator className="my-6" />
            
            <div className="grid gap-2">
              <Button variant="outline" className="w-full" type="button">
                <GithubIcon className="mr-2 h-4 w-4" />
                Sign up with GitHub
              </Button>
              <Button variant="outline" className="w-full" disabled={true} type="button">
                <ChromeIcon className="mr-2 h-4 w-4" />
                Sign up with Google
              </Button>
            </div>
            <p className="text-muted-foreground text-xs text-center my-2">
              For testing purposes, only Github is available.
            </p>
          </form>
        );

      case 1: // Profile Setup
        return (
          <form onSubmit={handleStepSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={data.profile?.bio || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('bio', e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                type="text"
                placeholder="Your company name"
                value={data.profile?.company || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('company', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={data.profile?.website || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('website', e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        );

      case 2: // Preferences
        return (
          <form onSubmit={handleStepSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="locale">Language & Region</Label>
              <Select
                value={data.preferences?.locale || 'en'}
                onValueChange={(value: string) => handleInputChange('locale', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your language" />
                </SelectTrigger>
                <SelectContent>
                  {LOCALE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.flag}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Notification Preferences</Label>
              {NOTIFICATION_OPTIONS.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{category.label}</p>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                    <Switch
                      checked={data.preferences?.notifications?.[category.id as keyof typeof data.preferences.notifications] || false}
                      onCheckedChange={(checked: boolean) => 
                        handleInputChange('notifications', {
                          ...data.preferences?.notifications,
                          [category.id]: checked,
                        })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Privacy Settings</Label>
              <Select
                value={data.preferences?.privacy?.profileVisibility || 'private'}
                onValueChange={(value: string) => 
                  handleInputChange('privacy', {
                    ...data.preferences?.privacy,
                    profileVisibility: value as 'public' | 'private' | 'team',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select profile visibility" />
                </SelectTrigger>
                <SelectContent>
                  {PRIVACY_VISIBILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        );

      case 3: // Welcome
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Welcome to LTM Starter Kit!</h3>
              <p className="text-muted-foreground">
                Your account has been created successfully. You&apos;re all set to start building amazing applications.
              </p>
            </div>
            <form onSubmit={handleStepSubmit}>
              <Button type="submit" className="w-full">
                Get Started
              </Button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/signin"
          className="rounded-md p-2 transition-colors hover:bg-muted"
          prefetch={false}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div />
      </div>
      
      <div className="flex items-center justify-center flex-1">
        <div className="w-full max-w-2xl space-y-8">
          {/* Step Indicator */}
          <div className="flex justify-center">
            <StepIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              stepLabels={ONBOARDING_STEPS.map(step => step.title)}
              className="w-full max-w-lg"
            />
          </div>

          {/* Main Content Card */}
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {ONBOARDING_STEPS[currentStep].title}
              </CardTitle>
              <CardDescription>
                {ONBOARDING_STEPS[currentStep].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation */}
          {currentStep > 0 && (
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <div className="text-sm text-muted-foreground flex items-center">
                Step {currentStep + 1} of {totalSteps}
              </div>
            </div>
          )}

          {/* Sign In Link */}
          <div className="text-center">
            <Link
              href="/signin"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function GithubIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function ChromeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" x2="12" y1="8" y2="8" />
      <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
      <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
    </svg>
  );
}
