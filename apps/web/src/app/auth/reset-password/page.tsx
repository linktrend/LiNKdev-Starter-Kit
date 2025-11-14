import Link from 'next/link'

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-xl space-y-8 rounded-2xl border bg-background/80 p-8 shadow-lg backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Update credentials
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Choose a new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter a secure password to complete the reset process. You&apos;ll be redirected after a successful update.
          </p>
        </div>

        <ResetPasswordForm />

        <p className="text-center text-sm text-muted-foreground">
          Remembered your password?{' '}
          <Link href="/en/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
