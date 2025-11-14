'use client'

import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'

import { signup, type AuthFormState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: AuthFormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Creating account…' : 'Create Account'}
    </Button>
  )
}

interface SignupFormProps {
  locale: string
}

export function SignupForm({ locale }: SignupFormProps) {
  const [state, formAction] = useFormState(signup, initialState)
  const errors = state?.error ?? {}

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          required
        />
        {errors.fullName?.map((message) => (
          <p key={message} className="text-sm text-destructive" aria-live="polite">
            {message}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        {errors.email?.map((message) => (
          <p key={message} className="text-sm text-destructive" aria-live="polite">
            {message}
          </p>
        ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
        {errors.password?.map((message) => (
          <p key={message} className="text-sm text-destructive" aria-live="polite">
            {message}
          </p>
        ))}
      </div>

      {errors.form?.map((message) => (
        <p key={message} className="text-sm text-destructive" aria-live="polite">
          {message}
        </p>
      ))}

      <SubmitButton />

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href={`/${locale}/login`} className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  )
}
