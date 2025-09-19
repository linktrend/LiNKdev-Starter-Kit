import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const RecordItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  created_at: z.string(),
});

export type RecordItem = z.infer<typeof RecordItemSchema>;

/**
 * List records for an organization
 */
export async function listOrgRecords(orgId: string, limit: number = 10): Promise<RecordItem[]> {
  try {
    const supabase = createClient({ cookies });
    
    const { data: records, error } = await supabase
      .from('records')
      .select(`
        id,
        created_at,
        record_types!inner(
          key
        )
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching records:', error);
      return [];
    }

    return (records || []).map(record => ({
      id: record.id,
      type: (record.record_types as any)?.key || 'unknown',
      created_at: record.created_at,
    }));
  } catch (error) {
    console.error('Error listing org records:', error);
    return [];
  }
}

/**
 * Get record count for an organization
 */
export async function getOrgRecordCount(orgId: string): Promise<number> {
  try {
    const supabase = createClient({ cookies });
    
    const { count, error } = await supabase
      .from('records')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    if (error) {
      console.error('Error counting records:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting record count:', error);
    return 0;
  }
}
