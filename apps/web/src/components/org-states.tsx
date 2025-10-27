import { Loader2, Building2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
/**
 * Loading state for organization data
 */
export function OrgLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading organization...</span>
      </div>
    </div>
  );
}

/**
 * Empty state when user has no organizations
 */
export function OrgEmpty() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <CardTitle>No Organizations Found</CardTitle>
        <CardDescription>
          You don&apos;t have access to any organizations yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          TODO: Add invite/create organization functionality
        </p>
        <div className="text-xs text-muted-foreground">
          Contact your administrator or create a new organization to get started.
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Forbidden state when user lacks access to organization
 */
export function OrgForbidden() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <CardTitle>Access Denied</CardTitle>
        <CardDescription>
          You don&apos;t have permission to access this organization.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground">
          Access denied or not a member.
        </p>
      </CardContent>
    </Card>
  );
}
