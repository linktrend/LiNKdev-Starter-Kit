'use client'

import { useFormState, useFormStatus } from 'react-dom'

import {
  requestPasswordReset,
  type AuthFormState,
} from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: AuthFormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Sending reset link…' : 'Send reset link'}
    </Button>
  )
}

interface ForgotPasswordFormProps {
  locale: string
}

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const [state, formAction] = useFormState(requestPasswordReset, initialState)
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

      {errors.form?.map((message) => (
        <p key={message} className="text-sm text-destructive" aria-live="polite">
          {message}
        </p>
      ))}

      {state?.success && state.message && (
        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700" aria-live="polite">
          {state.message}
        </p>
      )}

      <SubmitButton />
    </form>
  )
}
