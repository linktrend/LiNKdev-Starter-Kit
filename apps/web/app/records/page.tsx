import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getCurrentUserProfile } from '@/server/queries/user';
import { listOrgRecords, getOrgRecordCount } from '@/server/queries/records';
import { resolveOrgId, persistOrgCookie } from '@/server/org-context';
import { listUserMemberships } from '@/server/queries/orgs';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Database, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  FileText,
  Calendar,
  User,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { OrgContextProvider } from '@/components/org-context-provider';

export const metadata = {
  title: 'Records',
  description: 'Manage your data records and collections',
};

interface RecordsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const user = await getCurrentUserProfile();

  if (!user) {
    return redirect('/signin');
  }

  // Resolve organization context
  const requestCookies = cookies();
  const orgContext = await resolveOrgId({
    searchParams: searchParams as Record<string, string>,
    cookies: requestCookies,
    userId: user.id,
  });

  const { orgId, source } = orgContext;

  // If no org found, check if user has any memberships
  if (!orgId) {
    const memberships = await listUserMemberships(user.id);
    
    if (memberships.length === 0) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Records</h1>
            <p className="text-muted-foreground">
              No organizations found. TODO: invite/create org.
            </p>
          </div>
        </div>
      );
    }
    
    // User has memberships but no org context - this shouldn't happen with our resolver
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Records</h1>
          <p className="text-muted-foreground">
            Unable to determine organization context. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  // Get records data
  const [records, recordCount] = await Promise.all([
    listOrgRecords(orgId, 10),
    getOrgRecordCount(orgId),
  ]);

  return (
    <OrgContextProvider orgId={orgId} source={source}>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Records</h1>
          <p className="text-muted-foreground">
            Manage your data with flexible record types and custom fields
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recordCount}</div>
            <p className="text-xs text-muted-foreground">
              Total records in organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Record Types</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              TODO: Get from tRPC call
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+156</div>
            <p className="text-xs text-muted-foreground">
              New records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h</div>
            <p className="text-xs text-muted-foreground">
              Ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find specific records using filters and search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search Records</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title, content, or tags..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Record Type</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">All Types</option>
                <option value="contact">Contact</option>
                <option value="project">Project</option>
                <option value="task">Task</option>
                <option value="note">Note</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Record Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Record Types</CardTitle>
          <CardDescription>
            Choose a record type to view and manage records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Contacts</h3>
                    <p className="text-sm text-muted-foreground">342 records</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Projects</h3>
                    <p className="text-sm text-muted-foreground">89 records</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Tasks</h3>
                    <p className="text-sm text-muted-foreground">156 records</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Notes</h3>
                    <p className="text-sm text-muted-foreground">660 records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Records</CardTitle>
          <CardDescription>
            Your most recently created or updated records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {records.length > 0 ? (
              records.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{record.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.type} • Created {new Date(record.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/records/${record.id}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No records found
              </div>
            )}
          </div>
          
          <div className="pt-4">
            <Button variant="outline" className="w-full">
              View All Records
            </Button>
          </div>
          
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              TODO: Add pagination, search, and filtering
            </p>
          </div>
        </CardContent>
      </Card>

      {/* TODO Sections */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">TODO: Additional Features</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bulk Operations</CardTitle>
              <CardDescription>
                Manage multiple records at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                TODO: Add bulk edit, delete, and export functionality
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Custom Fields</CardTitle>
              <CardDescription>
                Create custom field types for records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                TODO: Add custom field management and validation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Record Templates</CardTitle>
              <CardDescription>
                Create reusable record templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                TODO: Add template creation and management
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </OrgContextProvider>
  );
}
