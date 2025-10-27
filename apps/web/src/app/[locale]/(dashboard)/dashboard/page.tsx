import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import {
  getUser,
  getUserDetails,
  getSubscription
} from '@/utils/supabase/queries';
import { redirect } from 'next/navigation';
import { DevNav } from '@/components/dev-nav';

// Inline Posts component for template
const Posts = ({ user }: { user: any }) => (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-4">Welcome, {user?.email || 'User'}!</h1>
    <p className="text-muted-foreground">
      This is a template dashboard. Replace this component with your actual content.
    </p>
  </div>
);

export default async function DashboardPage() {
  const supabase = createClient({ cookies });
  const [user, userDetails] = await Promise.all([
    getUser(),
    getUserDetails()
    ]);

  if (!user) {
    return redirect('/en/login');
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 gap-4">
      <Posts user={user} />
      <div className="container mx-auto p-4">
        <DevNav />
      </div>
    </div>
  );
}
