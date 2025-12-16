'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface AnalyticsChartProps {
  title: string;
  description?: string;
  data: any[];
  type: 'line' | 'bar' | 'area' | 'pie';
  config: {
    dataKey: string;
    label?: string; // For pie chart
    color?: string;
    stackId?: string;
  }[];
  xAxisKey?: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number, name: string) => [string, string];
  height?: number;
  className?: string;
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AnalyticsChart({
  title,
  description,
  data,
  type,
  config,
  xAxisKey = 'name',
  yAxisFormatter,
  tooltipFormatter,
  height = 350,
  className,
  loading,
}: AnalyticsChartProps) {
  const ChartComponent = () => {
    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-muted-foreground">
          No data available
        </div>
      );
    }

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis
                dataKey={xAxisKey}
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={yAxisFormatter}
              />
              <Tooltip
                contentStyle={{ borderRadius: '6px' }}
                formatter={tooltipFormatter}
              />
              <Legend />
              {config.map((c, i) => (
                <Line
                  key={c.dataKey}
                  type="monotone"
                  dataKey={c.dataKey}
                  stroke={c.color || COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  name={c.label || c.dataKey}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis
                dataKey={xAxisKey}
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={yAxisFormatter}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '6px' }}
                formatter={tooltipFormatter}
              />
              <Legend />
              {config.map((c, i) => (
                <Bar
                  key={c.dataKey}
                  dataKey={c.dataKey}
                  fill={c.color || COLORS[i % COLORS.length]}
                  stackId={c.stackId}
                  name={c.label || c.dataKey}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis
                dataKey={xAxisKey}
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={yAxisFormatter}
              />
              <Tooltip
                contentStyle={{ borderRadius: '6px' }}
                formatter={tooltipFormatter}
              />
              <Legend />
              {config.map((c, i) => (
                <Area
                  key={c.dataKey}
                  type="monotone"
                  dataKey={c.dataKey}
                  stackId={c.stackId}
                  stroke={c.color || COLORS[i % COLORS.length]}
                  fill={c.color || COLORS[i % COLORS.length]}
                  name={c.label || c.dataKey}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey={config[0].dataKey}
                nameKey={xAxisKey}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={config[0].color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <div style={{ height }}>
          <ChartComponent />
        </div>
      </CardContent>
    </Card>
  );
}
