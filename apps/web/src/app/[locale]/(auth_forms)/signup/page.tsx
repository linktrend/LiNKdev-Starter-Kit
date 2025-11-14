import { SignupForm } from '@/components/auth/SignupForm'

interface SignupPageProps {
  params: { locale?: string }
}

export default function SignupPage({ params }: SignupPageProps) {
  const locale = params?.locale ?? 'en'

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-xl space-y-8 rounded-2xl border bg-background/80 p-8 shadow-lg backdrop-blur">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Start building
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Access the dashboard, console, and all platform capabilities.
          </p>
        </div>

        <SignupForm locale={locale} />
      </div>
    </div>
  )
}
