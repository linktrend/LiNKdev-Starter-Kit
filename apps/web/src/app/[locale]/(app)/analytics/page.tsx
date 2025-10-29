import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold">12,345</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 justify-center">
                <TrendingUp className="h-3 w-3 text-green-500" />
                +12.5% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-warning" />
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold">8,291</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 justify-center">
                <TrendingUp className="h-3 w-3 text-green-500" />
                +8.2% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-success" />
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold">3.24%</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 justify-center">
                <TrendingUp className="h-3 w-3 text-green-500" />
                +0.4% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Overview</CardTitle>
            <CardDescription>Your site traffic over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary/30 hover:bg-primary/50 rounded-t transition-all cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
