'use client'

import { useEffect, useMemo, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

import { completeOnboardingStep2 } from '@/app/actions/profile'
import { api } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDebounce } from '@/hooks/use-debounce'

type FormErrors = Partial<Record<string, string[]>>

interface OnboardingStep2FormProps {
  user: {
    email: string
    first_name?: string | null
    last_name?: string | null
    display_name?: string | null
  }
  locale: string
}

export default function OnboardingStep2Form({ user, locale }: OnboardingStep2FormProps) {
  const router = useRouter()
  const initialUsername = useMemo(() => {
    const suggestion = user.email?.split('@')[0]?.toLowerCase() ?? ''
    return suggestion.replace(/[^a-z0-9_-]/gi, '')
  }, [user.email])

  const [username, setUsername] = useState(initialUsername)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const debouncedUsername = useDebounce(username, 400)

  useEffect(() => {
    let isCancelled = false

    async function validateUsername() {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        setUsernameAvailable(null)
        return
      }

      setCheckingUsername(true)
      
      try {
        const result = await api.checkUsername(debouncedUsername)

        if (!isCancelled) {
          setUsernameAvailable(result.available)
          setCheckingUsername(false)
          if (!result.available) {
            setErrors((prev) => ({
              ...prev,
              username: ['Username is already taken'],
            }))
          } else {
            setErrors((prev) => {
              const { username, ...rest } = prev
              return rest
            })
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setCheckingUsername(false)
          setUsernameAvailable(null)
          console.error('Error checking username:', error)
        }
      }
    }

    validateUsername()

    return () => {
      isCancelled = true
    }
  }, [debouncedUsername])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    formData.set('locale', locale)

    const result = await completeOnboardingStep2(formData)

    if (result?.error) {
      setErrors(result.error)
      setIsSubmitting(false)
      return
    }

    router.push(`/${locale}/dashboard`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />

      <div className="space-y-2">
        <Label htmlFor="username">
          Username <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
         <Input
            id="username"
            name="username"
            type="text"
            required
            placeholder="johndoe"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value)
              setErrors((prev) => {
                if (!prev.username) return prev
                const next = { ...prev }
                delete next.username
                return next
              })
            }}
            className={usernameAvailable === false ? 'border-destructive' : ''}
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
            {checkingUsername && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {!checkingUsername && usernameAvailable === true && (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
            {!checkingUsername && usernameAvailable === false && (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>
        {errors.username && (
          <p className="text-sm text-destructive">{errors.username[0]}</p>
        )}
        <p className="text-xs text-muted-foreground">
          3-30 characters using letters, numbers, underscores, or hyphens
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="first_name">
          First name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="first_name"
          name="first_name"
          type="text"
          defaultValue={user.first_name ?? ''}
          required
          placeholder="Ada"
        />
        {errors.first_name && (
          <p className="text-sm text-destructive">{errors.first_name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="last_name">
          Last name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="last_name"
          name="last_name"
          type="text"
          defaultValue={user.last_name ?? ''}
          required
          placeholder="Lovelace"
        />
        {errors.last_name && (
          <p className="text-sm text-destructive">{errors.last_name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="display_name">Display name (optional)</Label>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={user.display_name ?? ''}
          placeholder="Ada"
        />
        <p className="text-xs text-muted-foreground">
          How you would like your name to appear throughout the product.
        </p>
      </div>

      {errors.form && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {errors.form[0]}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || usernameAvailable === false}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving profile…
          </>
        ) : (
          'Complete profile'
        )}
      </Button>
    </form>
  )
}
