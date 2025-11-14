import { requireAuth } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import OnboardingStep2Form from '@/components/onboarding/onboarding-step-2-form'

interface OnboardingPageProps {
  params: {
    locale: string
  }
}

export default async function OnboardingPage({ params: { locale } }: OnboardingPageProps) {
  const user = await requireAuth()

  if (user.onboarding_completed) {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-2xl space-y-8 rounded-lg border bg-card p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm uppercase tracking-wide text-primary">Step 2 of 2</p>
          <h1 className="mt-2 text-3xl font-bold">Complete Your Profile</h1>
          <p className="mt-2 text-muted-foreground">
            Choose a username and share a bit about yourself to finish setting up your account.
          </p>
        </div>

        <OnboardingStep2Form
          user={{
            email: user.email ?? '',
            first_name: user.first_name,
            last_name: user.last_name,
            display_name: user.display_name,
          }}
          locale={locale}
        />
      </div>
    </div>
  )
}
