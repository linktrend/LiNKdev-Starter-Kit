'use client'

import { FormEvent, useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2, RefreshCcw, XCircle } from 'lucide-react'

import { createOrganization } from '@/app/actions/organization'
import { api } from '@/lib/api/client'
import { useLocalePath } from '@/hooks/useLocalePath'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

type FieldErrors = Record<string, string[]>

const ORG_TYPES = [
  { value: 'personal', label: 'Personal Workspace' },
  { value: 'business', label: 'Business / Team' },
  { value: 'family', label: 'Family' },
  { value: 'education', label: 'Education / Class' },
  { value: 'other', label: 'Other' },
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

type CreateOrgActionResult = Awaited<ReturnType<typeof createOrganization>>
const createOrganizationAction = createOrganization as unknown as (formData: FormData) => Promise<CreateOrgActionResult>

export default function CreateOrganizationForm() {
  const router = useRouter()
  const { locale } = useLocalePath()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [orgType, setOrgType] = useState('business')
  const [description, setDescription] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [checkingSlug, setCheckingSlug] = useState(false)

  const debouncedSlug = useDebounce(slug, 400)

  const canSubmit = useMemo(
    () => Boolean(name.trim().length >= 2 && slug.trim().length >= 3 && slugAvailable !== false),
    [name, slug, slugAvailable]
  )

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugManuallyEdited) {
      setSlug(slugify(value))
    }
  }

  const handleSlugChange = (value: string) => {
    setSlug(slugify(value))
    setSlugManuallyEdited(true)
  }

  const regenerateSlug = () => {
    setSlug(slugify(name))
    setSlugManuallyEdited(false)
  }

  useEffect(() => {
    let isCancelled = false

    async function validateSlug() {
      if (!debouncedSlug || debouncedSlug.length < 3) {
        setSlugAvailable(null)
        return
      }

      setCheckingSlug(true)

      try {
        const result = await api.checkSlug(debouncedSlug)

        if (!isCancelled) {
          setSlugAvailable(result.available)
          setCheckingSlug(false)
          if (!result.available) {
            setFieldErrors((prev) => ({
              ...prev,
              slug: ['Slug is already taken'],
            }))
          } else {
            setFieldErrors((prev) => {
              if (!prev) return null
              const { slug: _, ...rest } = prev
              return Object.keys(rest).length > 0 ? rest : null
            })
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setCheckingSlug(false)
          setSlugAvailable(null)
          console.error('Error checking slug:', error)
        }
      }
    }

    validateSlug()

    return () => {
      isCancelled = true
    }
  }, [debouncedSlug])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors(null)
    setFormError(null)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('slug', slug)
    formData.append('org_type', orgType)
    formData.append('description', description)
    formData.append('locale', locale)

    startTransition(async () => {
      const result = await createOrganizationAction(formData)

      if (result?.error) {
        const errors = result.error as FieldErrors
        setFieldErrors(errors)
        setFormError(errors.form?.[0] ?? null)
        return
      }

      if (result?.organization?.slug) {
        router.push(`/${locale}/organizations/${result.organization.slug}`)
      } else {
        router.push(`/${locale}/dashboard`)
      }
    })
  }

  const getError = (field: string) => fieldErrors?.[field]?.[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Organization Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Acme Corporation"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          required
        />
        {getError('name') && <p className="text-sm text-destructive">{getError('name')}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="slug">Organization Slug</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={regenerateSlug}
            disabled={!name}
            className="h-auto px-2 py-1 text-xs"
          >
            <RefreshCcw className="mr-1 h-3 w-3" />
            Generate
          </Button>
        </div>
        <div className="relative">
          <Input
            id="slug"
            name="slug"
            placeholder="acme-corp"
            value={slug}
            onChange={(event) => handleSlugChange(event.target.value)}
            required
            className={
              slug.length >= 3
                ? slugAvailable === true
                  ? 'pr-10 border-green-500'
                  : slugAvailable === false
                  ? 'pr-10 border-red-500'
                  : ''
                : ''
            }
          />
          {slug.length >= 3 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checkingSlug ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : slugAvailable === true ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : slugAvailable === false ? (
                <XCircle className="h-4 w-4 text-red-500" />
              ) : null}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Used in URLs. Lowercase letters, numbers, and hyphens only.
        </p>
        {getError('slug') && <p className="text-sm text-destructive">{getError('slug')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="org_type">Organization Type</Label>
        <Select value={orgType} onValueChange={setOrgType}>
          <SelectTrigger>
            <SelectValue placeholder="Select organization type" />
          </SelectTrigger>
          <SelectContent>
            {ORG_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {getError('org_type') && <p className="text-sm text-destructive">{getError('org_type')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Tell people what this organization is for."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
        />
        {getError('description') && (
          <p className="text-sm text-destructive">{getError('description')}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={!canSubmit || isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating organization...
          </>
        ) : (
          'Create Organization'
        )}
      </Button>
    </form>
  )
}
