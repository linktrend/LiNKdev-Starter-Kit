import { NextRequest, NextResponse } from 'next/server'

import { requireAuth, createClient } from '@/lib/auth/server'

function formatDate(date: Date) {
  return date.toISOString()
}

export async function GET(request: NextRequest) {
  const user = await requireAuth()
  const supabase = createClient() as any
  const { searchParams } = new URL(request.url)
  const orgId = searchParams.get('orgId') ?? undefined
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  const periodEnd = toParam ? new Date(toParam) : new Date()
  const periodStart = fromParam
    ? new Date(fromParam)
    : new Date(periodEnd.getTime() - 30 * 24 * 60 * 60 * 1000)

  const filterColumn = orgId ? 'org_id' : 'user_id'
  const filterValue = orgId ?? user.id

  const { data, error } = await supabase
    .from('usage_events')
    .select('created_at, event_type, quantity, org_id, event_data')
    .eq(filterColumn, filterValue)
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch usage events' }, { status: 500 })
  }

  const header = 'timestamp,event_type,quantity,org_id,metadata\n'
  const rows = (data ?? []).map((event: any) => {
    const metadata = event.event_data ? JSON.stringify(event.event_data) : '{}'
    return [
      (event.created_at && new Date(event.created_at).toISOString()) || '',
      event.event_type,
      Number(event.quantity ?? 0),
      event.org_id ?? '',
      `"${metadata.replace(/"/g, '""')}"`,
    ].join(',')
  })

  const csv = header + rows.join('\n')
  const filename = `usage-${orgId ?? user.id}-${formatDate(new Date())}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
