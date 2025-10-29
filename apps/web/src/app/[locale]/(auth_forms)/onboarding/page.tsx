'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepIndicator } from '@/components/ui/step-indicator';
import { useOnboarding } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, ArrowLeft, Check, Code, Palette, BarChart3 } from 'lucide-react';

const roleOptions = [
  { id: 'developer', labelKey: 'Developer', descKey: 'Building software and applications', icon: Code },
  { id: 'designer', labelKey: 'Designer', descKey: 'Creating beautiful user experiences', icon: Palette },
  { id: 'analyst', labelKey: 'Analyst', descKey: 'Analyzing data and insights', icon: BarChart3 },
];

interface OnboardingPageProps {
  params: { locale: string };
}

export default function OnboardingPage({ params: { locale } }: OnboardingPageProps) {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    data,
    updateData,
    nextStep,
    prevStep,
    canGoNext,
    isLoading,
  } = useOnboarding();
  
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  const onNext = async () => {
    nextStep();
    if (currentStep === totalSteps) {
      router.push(`/${locale}/dashboard`);
    }
  };

  const onSkip = () => {
    router.push(`/${locale}/dashboard`);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`);
    router.push(`/${locale}/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Welcome!</h1>
          </div>
          <p className="text-muted-foreground">Let&apos;s get you started</p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} className="mb-8" />

        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep}: {currentStep === 1 && 'Authentication' || currentStep === 2 && 'Name' || currentStep === 3 && 'Role' || currentStep === 4 && 'Preferences' || currentStep === 5 && 'Welcome'}</CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Sign in with your preferred method' || 'Complete your profile'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSocialLogin('Gmail')}
                    className="flex items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition-all"
                    aria-label="Sign up with Gmail"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleSocialLogin('Apple')}
                    className="flex items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition-all"
                    aria-label="Sign up with Apple"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleSocialLogin('Microsoft')}
                    className="flex items-center justify-center p-4 rounded-lg border bg-background hover:bg-accent transition-all"
                    aria-label="Sign up with Microsoft"
                  >
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path fill="#f25022" d="M0 0h11.377v11.372H0z"/>
                      <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z"/>
                      <path fill="#7fba00" d="M0 12.628h11.377V24H0z"/>
                      <path fill="#ffb900" d="M12.623 12.628H24V24H12.623z"/>
                    </svg>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">OR</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">OR</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-2"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    By continuing, you accept our Privacy Policy and Terms of Use
                  </label>
                </div>

                <Button 
                  className="w-full" 
                  onClick={onNext}
                  disabled={(!email && !phoneNumber) || !acceptedTerms || isLoading}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <button 
                  onClick={onSkip}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip for now
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={data.name}
                    onChange={(e) => updateData({ name: e.target.value })}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleOptions.map((role) => {
                  const IconComponent = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => updateData({ role: role.id })}
                      className={cn(
                        "p-6 rounded-lg border-2 transition-all duration-200 text-left",
                        "bg-background hover:bg-accent",
                        data.role === role.id
                          ? "border-primary shadow-lg"
                          : "border-border"
                      )}
                    >
                      <div className="mb-3">
                        <IconComponent className="w-10 h-10 text-primary" />
                      </div>
                      <div className="font-semibold mb-1">
                        {role.labelKey}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {role.descKey}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base">Notification Preferences</Label>
                  <div className="space-y-3">
                    {['email', 'push', 'inapp'].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-3 p-3 rounded-md bg-muted hover:bg-accent cursor-pointer transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={data.notifications?.[type as keyof typeof data.notifications]}
                          onChange={(e) =>
                            updateData({
                              notifications: {
                                ...data.notifications,
                                [type]: e.target.checked,
                              },
                            })
                          }
                          className="w-5 h-5 rounded border-2"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark', 'system'] as const).map((theme) => (
                      <button
                        key={theme}
                        onClick={() => updateData({ theme })}
                        className={cn(
                          "p-4 rounded-lg border-2 transition-all duration-200",
                          "bg-background hover:bg-accent",
                          data.theme === theme
                            ? "border-primary shadow-lg"
                            : "border-border"
                        )}
                      >
                        <div className="text-sm font-medium capitalize">
                          {theme}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="text-center py-8 space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                  <Check className="h-10 w-10 text-primary" />
                </div>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Welcome to LTM Starter Kit! You&apos;re all set to start building amazing applications.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t">
              <div>
                {currentStep > 1 && (
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {currentStep < totalSteps && currentStep !== 1 && (
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                  >
                    Skip
                  </Button>
                )}
                {currentStep !== 1 && (
                  <Button
                    onClick={onNext}
                    disabled={!canGoNext() || isLoading}
                  >
                    {currentStep === totalSteps ? (
                      <>
                        {isLoading ? 'Loading...' : 'Get Started'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
