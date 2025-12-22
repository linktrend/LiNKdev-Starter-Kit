import { useState } from 'react'
import { AlertCircle, CheckCircle2, Clock, Info, Loader2, XCircle } from 'lucide-react'

import type { ServiceHealthWithUptime } from '@/app/actions/health'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

type Props = {
  service: ServiceHealthWithUptime
}

const statusMap = {
  operational: { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle2, label: 'Operational' },
  degraded: { color: 'text-amber-600', bg: 'bg-amber-100', icon: AlertCircle, label: 'Degraded' },
  down: { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle, label: 'Down' },
}

export function HealthStatusCard({ service }: Props) {
  const [showDetails, setShowDetails] = useState(false)
  const status = statusMap[service.status]
  const Icon = status.icon

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className={`h-4 w-4 ${status.color}`} />
            {service.label}
          </CardTitle>
          <CardDescription className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Checked {new Date(service.checkedAt).toLocaleTimeString()}
          </CardDescription>
        </div>
        <Badge variant="secondary" className={`${status.bg} ${status.color} font-semibold`}>
          {status.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Response time</p>
            <p className="font-semibold">{service.responseTime} ms</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Uptime (24h)</p>
            <p className="font-semibold">{service.uptime24h.toFixed(2)}%</p>
          </div>
        </div>

        {service.error && (
          <div className="space-y-2">
            <button
              type="button"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowDetails((prev) => !prev)}
            >
              <Info className="h-4 w-4" />
              {showDetails ? 'Hide details' : 'View error details'}
            </button>
            {showDetails && (
              <div className="rounded-md border bg-muted/60 p-2 text-xs text-red-700 dark:text-red-300">
                {service.error}
              </div>
            )}
          </div>
        )}

        {service.status === 'down' && !service.error && (
          <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <Loader2 className="h-3 w-3 animate-spin" />
            Investigating outage
          </div>
        )}

        <Separator />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Cache window</span>
          <span>30s</span>
        </div>
      </CardContent>
    </Card>
  )
}
