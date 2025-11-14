import { requireAuth } from '@/lib/auth/server'
import CreateOrganizationForm from '@/components/organization/create-org-form'

export default async function NewOrganizationPage() {
  await requireAuth()

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold">Create Organization</h1>
        <p className="text-muted-foreground">
          Create a new team, family group, or educational organization.
        </p>
      </div>

      <CreateOrganizationForm />
    </div>
  )
}
