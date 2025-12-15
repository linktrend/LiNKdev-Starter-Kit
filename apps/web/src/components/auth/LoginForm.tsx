'use client'

import Link from 'next/link'
import { useFormState, useFormStatus } from 'react-dom'

import { login, type AuthFormState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: AuthFormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Signing in…' : 'Sign In'}
    </Button>
  )
}

interface LoginFormProps {
  locale: string
}

export function LoginForm({ locale }: LoginFormProps) {
  const [state, formAction] = useFormState(login, initialState)
  const errors = state?.error ?? {}

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />

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
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
        {errors.password?.map((message) => (
          <p key={message} className="text-sm text-destructive" aria-live="polite">
            {message}
          </p>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="rememberMe" name="rememberMe" defaultChecked />
        <label
          htmlFor="rememberMe"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Remember me for 30 days
        </label>
      </div>

      {errors.form?.map((message) => (
        <p key={message} className="text-sm text-destructive" aria-live="polite">
          {message}
        </p>
      ))}

      <SubmitButton />

      <div className="text-center text-sm">
        <Link href={`/${locale}/forgot-password`} className="text-primary hover:underline">
          Forgot password?
        </Link>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href={`/${locale}/signup`} className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  )
}
