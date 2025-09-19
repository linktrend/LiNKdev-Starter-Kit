import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { getUser } from '@/utils/supabase/queries';
import { listUserMemberships } from '@/src/server/org-context';

/**
 * GET /api/orgs/memberships
 * Returns user's organization memberships for the org switcher
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient({ cookies });
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user memberships
    const memberships = await listUserMemberships(user.id);

    // TODO: In a real app, you'd also fetch org names from the organizations table
    // For now, we'll return the basic membership data
    const membershipsWithNames = memberships.map(membership => ({
      ...membership,
      name: `Organization ${membership.org_id.slice(0, 8)}`, // Placeholder name
    }));

    return NextResponse.json(membershipsWithNames);
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memberships' },
      { status: 500 }
    );
  }
}
