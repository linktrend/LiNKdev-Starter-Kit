import Link from 'next/link'

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

interface ForgotPasswordPageProps {
  params: { locale?: string }
}

export default function ForgotPasswordPage({ params }: ForgotPasswordPageProps) {
  const locale = params?.locale ?? 'en'

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-xl space-y-8 rounded-2xl border bg-background/80 p-8 shadow-lg backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Reset password
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Check your inbox
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the email associated with your account and we&apos;ll send instructions to reset your password.
          </p>
        </div>

        <ForgotPasswordForm locale={locale} />

        <p className="text-center text-sm text-muted-foreground">
          Remembered your password?{' '}
          <Link href={`/${locale}/login`} className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
