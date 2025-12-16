import { requireAdmin } from '@/lib/auth/server'
import { HealthConsoleClient } from '@/components/console/HealthConsoleClient'

export default async function ConsoleHealthPage() {
  await requireAdmin()
  return <HealthConsoleClient />
}
