import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, Server, Database, Activity } from 'lucide-react';

export default function ConsoleOverviewPage() {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">45%</div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full bg-primary" style={{ width: '45%' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-warning" />
              <CardTitle className="text-sm font-medium">Memory</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">6.2 GB</div>
            <p className="text-xs text-muted-foreground mt-1">of 16 GB total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-success" />
              <CardTitle className="text-sm font-medium">Database</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">Online</div>
            <p className="text-xs text-green-600 mt-1">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-danger" />
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-2xl font-bold">1.2M</div>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>Recent system activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 font-mono text-sm">
            {[
              { level: 'info', message: 'Database backup completed successfully', time: '10:34:12' },
              { level: 'info', message: 'API server started on port 3000', time: '10:32:45' },
              { level: 'warn', message: 'High memory usage detected (85%)', time: '10:30:22' },
              { level: 'info', message: 'User authentication successful', time: '10:28:15' },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded bg-muted hover:bg-accent transition-all">
                <span
                  className={`w-2 h-2 rounded-full ${
                    log.level === 'info' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}
                />
                <span className="text-muted-foreground">[{log.time}]</span>
                <span className={log.level === 'info' ? 'text-blue-600' : 'text-yellow-600'}>
                  {log.level.toUpperCase()}
                </span>
                <span className="flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
