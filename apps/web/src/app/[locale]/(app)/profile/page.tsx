import ProfileEditModal from '@/components/profile/profile-edit-modal'
import ProfileViewCard from '@/components/profile/profile-view-card'
import { requireAuth } from '@/lib/auth/server'

interface ProfilePageProps {
  params: {
    locale: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await requireAuth()

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            View and manage your personal and business information.
          </p>
        </div>
        <ProfileEditModal user={user} locale={params.locale} />
      </div>

      <ProfileViewCard user={user} />
    </div>
  )
}
