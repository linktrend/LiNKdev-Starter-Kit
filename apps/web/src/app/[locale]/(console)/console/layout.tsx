import type { PropsWithChildren } from 'react'

import ConsoleLayoutClient from '@/components/console/ConsoleLayoutClient'
import { requireAdmin } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

interface ConsoleLayoutProps extends PropsWithChildren {
  params: { locale?: string }
}

export default async function ConsoleLayout({ children, params }: ConsoleLayoutProps) {
  const locale = params?.locale ?? 'en'

  try {
    await requireAdmin()
  } catch {
    redirect(`/${locale}/dashboard`)
  }

  return <ConsoleLayoutClient>{children}</ConsoleLayoutClient>
}
