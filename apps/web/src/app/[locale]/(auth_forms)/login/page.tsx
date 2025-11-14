import { LoginForm } from '@/components/auth/LoginForm'

interface LoginPageProps {
  params: { locale?: string }
}

export default function LoginPage({ params }: LoginPageProps) {
  const locale = params?.locale ?? 'en'

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl border bg-background/80 p-8 shadow-lg backdrop-blur">
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Secure access
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue to your workspace
          </p>
        </div>

        <LoginForm locale={locale} />
      </div>
    </div>
  )
}
