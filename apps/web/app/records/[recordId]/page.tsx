import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getUser } from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  Tag,
  FileText,
  MoreVertical,
  Copy,
  Share
} from 'lucide-react';
import Link from 'next/link';

interface RecordDetailPageProps {
  params: {
    recordId: string;
  };
}

export async function generateMetadata({ params }: RecordDetailPageProps) {
  return {
    title: `Record Details`,
    description: `View and manage record details`,
  };
}

export default async function RecordDetailPage({ params }: RecordDetailPageProps) {
  const supabase = createClient({ cookies });
  const user = await getUser();

  if (!user) {
    return redirect('/signin');
  }

  const { recordId } = params;

  // TODO: Fetch record details with tRPC call
  // const { data: record } = await api.records.getRecord.useQuery({ id: recordId });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/records">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Records
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Record Details</h1>
            <p className="text-muted-foreground">
              Record ID: {recordId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Core details about this record
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <p className="text-sm text-muted-foreground">
                    Sample Record Title
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Badge variant="outline">Contact</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-muted-foreground">
                  This is a sample record description that provides context about the record and its purpose.
                </p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Badge variant="secondary">Medium</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
              <CardDescription>
                Additional data specific to this record type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">
                    john@example.com
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-muted-foreground">
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <p className="text-sm text-muted-foreground">
                  123 Main Street, Anytown, ST 12345
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <p className="text-sm text-muted-foreground">
                  Additional notes and comments about this record.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                Recent changes and updates to this record
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Record created</p>
                    <p className="text-xs text-muted-foreground">
                      Created by John Doe • 2 days ago
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Status updated</p>
                    <p className="text-xs text-muted-foreground">
                      Changed from "Draft" to "Active" • 1 day ago
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Field updated</p>
                    <p className="text-xs text-muted-foreground">
                      Email address updated • 4 hours ago
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <p className="text-xs text-muted-foreground">
                  TODO: Implement real activity timeline with tRPC calls
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Record Info */}
          <Card>
            <CardHeader>
              <CardTitle>Record Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-xs text-muted-foreground">
                    December 15, 2023
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created by</p>
                  <p className="text-xs text-muted-foreground">
                    John Doe
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    2 hours ago
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Updated by</p>
                  <p className="text-xs text-muted-foreground">
                    Jane Smith
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Important</Badge>
                <Badge variant="outline">Client</Badge>
                <Badge variant="outline">Follow-up</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Record
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Share className="mr-2 h-4 w-4" />
                Share
              </Button>
              
              <Separator />
              
              <Button className="w-full justify-start" variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Record
              </Button>
            </CardContent>
          </Card>

          {/* TODO Section */}
          <Card>
            <CardHeader>
              <CardTitle>TODO: Additional Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  • Implement real record fetching with tRPC
                </p>
                <p className="text-xs text-muted-foreground">
                  • Add record editing functionality
                </p>
                <p className="text-xs text-muted-foreground">
                  • Add record deletion with confirmation
                </p>
                <p className="text-xs text-muted-foreground">
                  • Add record sharing and permissions
                </p>
                <p className="text-xs text-muted-foreground">
                  • Add record versioning and history
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
