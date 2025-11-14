'use client'

import { FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { updateOrganization } from '@/app/actions/organization'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface OrganizationSettingsFormProps {
  orgId: string
  locale: string
  initialName: string
  initialDescription: string | null
  canEdit: boolean
}

type FieldErrors = Record<string, string[]>

export function OrganizationSettingsForm({
  orgId,
  locale,
  initialName,
  initialDescription,
  canEdit,
}: OrganizationSettingsFormProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription ?? '')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canEdit) return
    setFieldErrors(null)

    const formData = new FormData()
    formData.append('org_id', orgId)
    formData.append('name', name)
    formData.append('description', description)
    formData.append('locale', locale)

    startTransition(async () => {
      const result = await updateOrganization(formData)

      if (result?.error) {
        setFieldErrors(result.error as FieldErrors)
        if ((result.error as FieldErrors).form?.[0]) {
          toast({
            title: 'Update failed',
            description: (result.error as FieldErrors).form?.[0],
            variant: 'destructive',
          })
        }
        return
      }

      toast({
        title: 'Organization updated',
        description: 'Your changes have been saved.',
      })
      router.refresh()
    })
  }

  const getError = (field: string) => fieldErrors?.[field]?.[0]

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="org-name">Organization name</Label>
        <Input
          id="org-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={!canEdit}
          required
        />
        {getError('name') && <p className="text-sm text-destructive">{getError('name')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="org-description">Description</Label>
        <Textarea
          id="org-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          disabled={!canEdit}
        />
        {getError('description') && (
          <p className="text-sm text-destructive">{getError('description')}</p>
        )}
      </div>

      <Button type="submit" disabled={!canEdit || isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving changes...
          </>
        ) : (
          'Save changes'
        )}
      </Button>
    </form>
  )
}
