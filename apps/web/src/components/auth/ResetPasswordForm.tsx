'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'

import { updatePassword, type AuthFormState } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: AuthFormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Updating password…' : 'Update password'}
    </Button>
  )
}

export function ResetPasswordForm() {
  const [state, formAction] = useFormState(updatePassword, initialState)
  const [mismatchError, setMismatchError] = useState<string | null>(null)
  const errors = state?.error ?? {}

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (mismatchError) {
      setMismatchError(null)
    }

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')
    const confirm = formData.get('confirmPassword')

    if (password !== confirm) {
      event.preventDefault()
      setMismatchError('Passwords do not match')
    }
  }

  return (
    <form action={formAction} className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          required
        />
      </div>

      {[...(mismatchError ? [mismatchError] : []), ...(errors.password ?? [])].map((message) => (
        <p key={message} className="text-sm text-destructive" aria-live="polite">
          {message}
        </p>
      ))}

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
