import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConsoleSecurityPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Security & Access</CardTitle>
          <CardDescription>Manage security settings and access controls</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Content for Security & Access will be displayed here. This includes security policies, 
            access control, and audit logs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}