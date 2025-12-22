'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ActivitySummaryResponse } from '@starter/types';
import { CalendarClock, PieChart as PieChartIcon, Users } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Props = {
  summary?: ActivitySummaryResponse;
  loading?: boolean;
};

const COLORS = [
  'hsl(var(--success))',
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--warning))',
  'hsl(var(--danger))',
  'hsl(var(--foreground))',
];

export function AuditSummary({ summary, loading }: Props) {
  const timelineData =
    summary?.timeline.map((item) => ({
      timestamp: item.timestamp,
      label: new Date(item.timestamp).toLocaleDateString(),
      count: item.count,
    })) ?? [];

  const actionsData =
    Object.entries(summary?.by_action ?? {}).map(([action, count]) => ({
      name: action,
      value: count,
    })) ?? [];

  const entitiesData =
    Object.entries(summary?.by_entity_type ?? {}).map(([entity, count]) => ({
      name: entity,
      value: count,
    })) ?? [];

  const topActors = summary?.top_actors ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total actions</CardTitle>
          <CalendarClock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '—' : summary?.total ?? 0}</div>
          <p className="text-xs text-muted-foreground">
            {summary?.period ? `${new Date(summary.period.from).toLocaleDateString()} — ${new Date(summary.period.to).toLocaleDateString()}` : 'Selected period'}
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top actors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
          {!loading && topActors.length === 0 && <p className="text-xs text-muted-foreground">No actor data</p>}
          {topActors.map((actor, idx) => (
            <div key={actor.actor_id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Badge variant="outline">{idx + 1}</Badge>
                {actor.actor_id}
              </span>
              <span className="text-muted-foreground">{actor.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activity timeline</CardTitle>
          <PieChartIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Actions by type</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" nameKey="name" data={actionsData} cx="50%" cy="50%" outerRadius={80} label>
                {actionsData.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entity breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={entitiesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--success))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
