import { Metadata } from 'next';
import { Link, Zap, MessageSquare, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'External Integrations'
};

export default function IntegrationsPage() {
  // Mock integration data
  const mockIntegrations = [
    {
      id: 1,
      name: 'Slack',
      description: 'Team communication and notifications',
      status: 'Connected',
      icon: MessageSquare
    },
    {
      id: 2,
      name: 'Zapier',
      description: 'Automation and workflow connections',
      status: 'Available',
      icon: Zap
    },
    {
      id: 3,
      name: 'Salesforce',
      description: 'CRM and customer management',
      status: 'Available',
      icon: Building
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Connected':
        return 'default';
      case 'Available':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect with external services and APIs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            External Integrations
          </CardTitle>
          <CardDescription>
            Connect with external services and APIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockIntegrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <Card key={integration.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-medium">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={getStatusVariant(integration.status)}>
                        {integration.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={integration.status === 'Connected'}
                      >
                        {integration.status === 'Connected' ? 'Connected' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
