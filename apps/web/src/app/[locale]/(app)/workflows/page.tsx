import { Metadata } from 'next';
import { Zap, Play, Pause, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Workflows & Automations'
};

export default function WorkflowsPage() {
  // Mock workflow data
  const mockWorkflows = [
    {
      id: 1,
      name: 'Email Notification Workflow',
      status: 'Active',
      lastRun: '2024-01-15 10:30',
      triggers: 3
    },
    {
      id: 2,
      name: 'Data Sync Automation',
      status: 'Paused',
      lastRun: '2024-01-14 15:45',
      triggers: 1
    },
    {
      id: 3,
      name: 'Report Generation',
      status: 'Active',
      lastRun: '2024-01-15 09:15',
      triggers: 5
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Paused':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">
            Streamline your processes with automated workflows
          </p>
        </div>
        <Button variant="glass">
          <Zap className="mr-2 h-4 w-4" />
          Create New Workflow
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            User Workflows & Automations
          </CardTitle>
          <CardDescription>
            Streamline your processes with automated workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockWorkflows.map((workflow) => (
              <Card key={workflow.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">{workflow.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Last run: {workflow.lastRun}</span>
                      <span>{workflow.triggers} trigger{workflow.triggers !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(workflow.status)}>
                      {workflow.status}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        {workflow.status === 'Active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
