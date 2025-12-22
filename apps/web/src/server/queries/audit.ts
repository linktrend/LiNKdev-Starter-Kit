import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const AuditItemSchema = z.object({
  id: z.string(),
  action: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  details: z.record(z.any()).nullable(),
  created_at: z.string(),
  user_id: z.string(),
});

export type AuditItem = z.infer<typeof AuditItemSchema>;

/**
 * List recent organization activity from audit logs
 */
export async function listRecentOrgActivity(orgId: string, limit: number = 5): Promise<AuditItem[]> {
  // TEMPORARY: Offline mode for testing
  if (process.env.TEMPLATE_OFFLINE === '1') {
    return [];
  }

  try {
    const supabase = createClient({ cookies });
    
    const { data: activities, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audit activities:', error);
      return [];
    }

    type ActivityResult = {
      id: string;
      action: string;
      entity_type: string;
      entity_id: string;
      details: Record<string, any> | null;
      created_at: string;
      user_id: string | null;
    };
    const typedActivities = (activities as ActivityResult[]) || [];

    return typedActivities.map(activity => ({
      id: activity.id,
      action: activity.action,
      entity_type: activity.entity_type,
      entity_id: activity.entity_id,
      details: activity.details,
      created_at: activity.created_at,
      user_id: activity.user_id || '',
    }));
  } catch (error) {
    console.error('Error listing org activity:', error);
    return [];
  }
}
