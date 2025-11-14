import { requireAuth } from '@/lib/auth/server'
import AccountSettingsClient from './account-settings-client'

interface AccountSettingsPageProps {
  params: {
    locale: string
  }
}

export default async function AccountSettingsPage({ params }: AccountSettingsPageProps) {
  const user = await requireAuth()

  return <AccountSettingsClient user={user} locale={params.locale} />
}
