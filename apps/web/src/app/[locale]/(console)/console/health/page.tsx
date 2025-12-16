import { requireAdmin } from '@/lib/auth/server'
import { HealthPageClient } from './HealthPageClient'

export default async function ConsoleHealthPage() {
  await requireAdmin()
  return <HealthPageClient />
}
