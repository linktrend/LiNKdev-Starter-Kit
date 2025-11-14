import ProfileEditModal from '@/components/profile/profile-edit-modal'
import ProfileViewCard from '@/components/profile/profile-view-card'
import { Button } from '@/components/ui/button'
import { requireAuth } from '@/lib/auth/server'

interface DashboardProfilePageProps {
  params: {
    locale: string
  }
}

export default async function DashboardProfilePage({ params }: DashboardProfilePageProps) {
  const user = await requireAuth()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-primary">Account</p>
          <h1 className="text-2xl font-semibold">Your profile</h1>
          <p className="text-muted-foreground">
            Keep your contact details and work history up to date.
          </p>
        </div>
        <ProfileEditModal user={user} locale={params.locale} trigger={<Button>Edit profile</Button>} />
      </div>

      <ProfileViewCard user={user} />
    </div>
  )
}
