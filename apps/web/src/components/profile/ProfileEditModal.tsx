'use client'

import { ReactNode, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Loader2, Plus, Trash2, XCircle } from 'lucide-react'

import {
  checkUsernameAvailability,
  updateProfile,
} from '@/app/actions/profile'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useDebounce } from '@/hooks/use-debounce'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import type { Database } from '@/types/database.types'
import type {
  EducationEntry,
  WorkExperienceEntry,
} from '@/lib/validation/profile'

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2)
}

const emptyEducation = (): EducationEntry => ({
  id: generateId(),
  institution: '',
  degree: '',
  field: '',
  start_year: undefined,
  end_year: undefined,
  current: false,
})

const emptyWork = (): WorkExperienceEntry => ({
  id: generateId(),
  company: '',
  position: '',
  start_date: '',
  end_date: '',
  current: false,
  description: '',
})

type UserRow = Database['public']['Tables']['users']['Row']

type FormErrors = Partial<Record<string, string[]>>

interface ProfileEditModalProps {
  user: UserRow
  locale: string
  trigger?: ReactNode
}

function parseArray<T>(value: unknown, fallback: () => T): T[] {
  if (Array.isArray(value)) {
    return (value as T[]).map((entry) => {
      const base = fallback()
      return { ...base, ...entry, id: (entry as { id?: string })?.id ?? (base as { id?: string }).id }
    })
  }
  return []
}

export function ProfileEditModal({ user, locale, trigger }: ProfileEditModalProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usernameInput, setUsernameInput] = useState(user.username ?? '')
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [education, setEducation] = useState<EducationEntry[]>(() => {
    const parsed = parseArray<EducationEntry>(user.education, emptyEducation)
    return parsed.length > 0 ? parsed : [emptyEducation()]
  })
  const [workExperience, setWorkExperience] = useState<WorkExperienceEntry[]>(() => {
    const parsed = parseArray<WorkExperienceEntry>(user.work_experience, emptyWork)
    return parsed.length > 0 ? parsed : [emptyWork()]
  })

  const debouncedUsername = useDebounce(usernameInput, 400)

  const fullName = useMemo(() => {
    return (
      user.full_name ||
      [user.first_name, user.last_name].filter(Boolean).join(' ') ||
      'Your profile'
    )
  }, [user.first_name, user.full_name, user.last_name])

  useEffect(() => {
    let isCancelled = false

    async function validateUsername() {
      if (!debouncedUsername || debouncedUsername === user.username) {
        setUsernameAvailable(null)
        return
      }

      if (debouncedUsername.length < 3) {
        setUsernameAvailable(false)
        return
      }

      setCheckingUsername(true)
      const result = await checkUsernameAvailability(debouncedUsername, {
        excludeUserId: user.id,
      })

      if (!isCancelled) {
        setUsernameAvailable(result.available)
        setCheckingUsername(false)
        if (!result.available && result.error) {
          setErrors((prev) => ({
            ...prev,
            username: [result.error],
          }))
        }
      }
    }

    validateUsername().catch(() => {
      if (!isCancelled) {
        setCheckingUsername(false)
        setUsernameAvailable(null)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [debouncedUsername, user.id, user.username])

  function resetState() {
    setErrors({})
    setIsSubmitting(false)
    setUsernameInput(user.username ?? '')
    setUsernameAvailable(null)
    setCheckingUsername(false)
    setEducation(() => {
      const parsed = parseArray<EducationEntry>(user.education, emptyEducation)
      return parsed.length > 0 ? parsed : [emptyEducation()]
    })
    setWorkExperience(() => {
      const parsed = parseArray<WorkExperienceEntry>(user.work_experience, emptyWork)
      return parsed.length > 0 ? parsed : [emptyWork()]
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(event.currentTarget)
    formData.set('education', JSON.stringify(education))
    formData.set('work_experience', JSON.stringify(workExperience))
    formData.set('locale', locale)

    const result = await updateProfile(formData)

    if (result?.error) {
      setErrors(result.error)
      setIsSubmitting(false)
      return
    }

    toast({
      title: 'Profile updated',
      description: 'Your profile information was saved successfully.',
    })

    setIsSubmitting(false)
    setOpen(false)
  }

  const renderFieldError = (key: string) => {
    if (!errors[key]) return null
    return <p className="text-sm text-destructive">{errors[key]?.[0]}</p>
  }

  function updateEducationEntry(id: string, field: keyof EducationEntry, value: string | number | boolean | null) {
    setEducation((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    )
  }

  function updateWorkEntry(id: string, field: keyof WorkExperienceEntry, value: string | boolean | null) {
    setWorkExperience((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          resetState()
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? <Button variant="outline">Edit profile</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update personal details, contact information, and work history.</DialogDescription>
        </DialogHeader>

        <form id="profile-edit-form" className="space-y-6" onSubmit={handleSubmit}>

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Basic information</h3>
              <p className="text-sm text-muted-foreground">
                These details appear on your profile and throughout the product.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="display_name">Display name</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  defaultValue={user.display_name ?? fullName}
                  placeholder="Display name"
                />
                {renderFieldError('display_name')}
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    value={usernameInput}
                    onChange={(event) => {
                      setUsernameInput(event.target.value)
                      setErrors((prev) => {
                        if (!prev.username) return prev
                        const next = { ...prev }
                        delete next.username
                        return next
                      })
                    }}
                    placeholder="johndoe"
                  />
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    {checkingUsername && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    {!checkingUsername && usernameAvailable === true && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    {!checkingUsername && usernameAvailable === false && (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
                {renderFieldError('username')}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  defaultValue={user.first_name ?? ''}
                  required
                />
                {renderFieldError('first_name')}
              </div>
              <div>
                <Label htmlFor="middle_name">Middle name</Label>
                <Input id="middle_name" name="middle_name" defaultValue={user.middle_name ?? ''} />
              </div>
              <div>
                <Label htmlFor="last_name">Last name</Label>
                <Input id="last_name" name="last_name" defaultValue={user.last_name ?? ''} required />
                {renderFieldError('last_name')}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="personal_title">Title</Label>
                <Input id="personal_title" name="personal_title" defaultValue={user.personal_title ?? ''} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Profile picture</Label>
              <AvatarUpload user={user} locale={locale} />
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Contact details</h3>
              <p className="text-sm text-muted-foreground">
                Keep this information current so teammates can reach you.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="phone_country_code">Country code</Label>
                <Input
                  id="phone_country_code"
                  name="phone_country_code"
                  defaultValue={user.phone_country_code ?? ''}
                  placeholder="+1"
                />
              </div>
              <div>
                <Label htmlFor="phone_number">Phone number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  defaultValue={user.phone_number ?? ''}
                  placeholder="5551234567"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="personal_street_address_1">Street address</Label>
                <Input
                  id="personal_street_address_1"
                  name="personal_street_address_1"
                  defaultValue={user.personal_street_address_1 ?? ''}
                />
              </div>
              <div>
                <Label htmlFor="personal_street_address_2">Address line 2</Label>
                <Input
                  id="personal_street_address_2"
                  name="personal_street_address_2"
                  defaultValue={user.personal_street_address_2 ?? ''}
                />
              </div>
              <div>
                <Label htmlFor="personal_city">City</Label>
                <Input id="personal_city" name="personal_city" defaultValue={user.personal_city ?? ''} />
              </div>
              <div>
                <Label htmlFor="personal_state">State / Region</Label>
                <Input id="personal_state" name="personal_state" defaultValue={user.personal_state ?? ''} />
              </div>
              <div>
                <Label htmlFor="personal_postal_code">Postal code</Label>
                <Input
                  id="personal_postal_code"
                  name="personal_postal_code"
                  defaultValue={user.personal_postal_code ?? ''}
                />
              </div>
              <div>
                <Label htmlFor="personal_country">Country</Label>
                <Input
                  id="personal_country"
                  name="personal_country"
                  defaultValue={user.personal_country ?? ''}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">About you</h3>
              <p className="text-sm text-muted-foreground">
                Share your background, education, and work history.
              </p>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                placeholder="Tell us about yourself"
                defaultValue={user.bio ?? ''}
              />
              {renderFieldError('bio')}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Education</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEducation((prev) => [...prev, emptyEducation()])}>
                  <Plus className="mr-2 h-4 w-4" /> Add education
                </Button>
              </div>
              <div className="space-y-3">
                {education.map((entry, index) => (
                  <div key={entry.id ?? index} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Entry {index + 1}</p>
                      {education.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setEducation((prev) => prev.filter((item) => item.id !== entry.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Label>Institution</Label>
                        <Input
                          value={entry.institution}
                          onChange={(e) => updateEducationEntry(entry.id!, 'institution', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Degree</Label>
                        <Input
                          value={entry.degree ?? ''}
                          onChange={(e) => updateEducationEntry(entry.id!, 'degree', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Field</Label>
                        <Input
                          value={entry.field ?? ''}
                          onChange={(e) => updateEducationEntry(entry.id!, 'field', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Start year</Label>
                          <Input
                            type="number"
                            min={1900}
                            max={2100}
                            value={entry.start_year ?? ''}
                            onChange={(e) =>
                              updateEducationEntry(
                                entry.id!,
                                'start_year',
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label>End year</Label>
                          <Input
                            type="number"
                            min={1900}
                            max={2100}
                            value={entry.end_year ?? ''}
                            onChange={(e) =>
                              updateEducationEntry(
                                entry.id!,
                                'end_year',
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Work experience</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => setWorkExperience((prev) => [...prev, emptyWork()])}>
                  <Plus className="mr-2 h-4 w-4" /> Add role
                </Button>
              </div>
              <div className="space-y-3">
                {workExperience.map((entry, index) => (
                  <div key={entry.id ?? index} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Position {index + 1}</p>
                      {workExperience.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setWorkExperience((prev) => prev.filter((item) => item.id !== entry.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={entry.company}
                          onChange={(e) => updateWorkEntry(entry.id!, 'company', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input
                          value={entry.position}
                          onChange={(e) => updateWorkEntry(entry.id!, 'position', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Start date</Label>
                        <Input
                          type="text"
                          placeholder="Jan 2020"
                          value={entry.start_date ?? ''}
                          onChange={(e) => updateWorkEntry(entry.id!, 'start_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End date</Label>
                        <Input
                          type="text"
                          placeholder="Present"
                          value={entry.end_date ?? ''}
                          onChange={(e) => updateWorkEntry(entry.id!, 'end_date', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                          value={entry.description ?? ''}
                          onChange={(e) => updateWorkEntry(entry.id!, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Business information</h3>
              <p className="text-sm text-muted-foreground">
                This information helps with billing, invoicing, and verification.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="business_position">Position</Label>
                <Input
                  id="business_position"
                  name="business_position"
                  defaultValue={user.business_position ?? ''}
                />
              </div>
              <div>
                <Label htmlFor="business_company">Company</Label>
                <Input id="business_company" name="business_company" defaultValue={user.business_company ?? ''} />
              </div>
              <div>
                <Label htmlFor="business_street_address_1">Street address</Label>
                <Input
                  id="business_street_address_1"
                  name="business_street_address_1"
                  defaultValue={user.business_street_address_1 ?? ''}
                />
              </div>
              <div>
                <Label htmlFor="business_street_address_2">Address line 2</Label>
                <Input
                  id="business_street_address_2"
                  name="business_street_address_2"
                  defaultValue={user.business_street_address_2 ?? ''}
                />
              </div>
              <div>
                <Label htmlFor="business_city">City</Label>
                <Input id="business_city" name="business_city" defaultValue={user.business_city ?? ''} />
              </div>
              <div>
                <Label htmlFor="business_state">State / Region</Label>
                <Input id="business_state" name="business_state" defaultValue={user.business_state ?? ''} />
              </div>
              <div>
                <Label htmlFor="business_postal_code">Postal code</Label>
                <Input
                  id="business_postal_code"
                  name="business_postal_code"
                  defaultValue={user.business_postal_code ?? ''}
                />
              </div>
              <div>
                <Label htmlFor="business_country">Country</Label>
                <Input id="business_country" name="business_country" defaultValue={user.business_country ?? ''} />
              </div>
            </div>
          </section>

          {errors.form && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.form[0]}
            </div>
          )}
        </form>

        <DialogFooter>
          <Button type="submit" form="profile-edit-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileEditModal
