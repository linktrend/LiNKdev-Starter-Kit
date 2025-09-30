import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the first organization for testing
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (!orgs || orgs.length === 0) {
      return NextResponse.json({ error: 'No organizations found' }, { status: 400 });
    }
    
    const orgId = orgs[0].id;
    
    // Insert a test audit log
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        org_id: orgId,
        action: 'test_realtime',
        entity_type: 'test',
        entity_id: 'test-' + Date.now(),
        metadata: { test: true, timestamp: new Date().toISOString() },
        actor_id: null, // System action
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting test audit log:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      auditLog: data,
      message: 'Test audit log inserted successfully. Check the audit page for real-time updates.'
    });
    
  } catch (error) {
    console.error('Test realtime error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
