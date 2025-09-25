import { NextRequest, NextResponse } from 'next/server';
import { processPendingEvents } from '@/server/automation/outbox';

// Optional: Add basic auth for cron endpoint security
const CRON_SECRET = process.env.CRON_SECRET;

function verifyCronAuth(request: NextRequest): boolean {
  if (!CRON_SECRET) {
    // In development/template mode, allow without auth
    return true;
  }
  
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${CRON_SECRET}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify cron authentication
    if (!verifyCronAuth(request)) {
      console.warn('AUTOMATION: Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('AUTOMATION: Cron delivery tick started');
    const startTime = Date.now();
    
    // Process pending events
    const result = await processPendingEvents();
    const duration = Date.now() - startTime;
    
    console.log('AUTOMATION: Cron delivery tick completed', {
      ...result,
      duration,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Delivery tick completed',
      ...result,
      duration,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('AUTOMATION: Cron delivery tick failed', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Automation delivery cron endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
  });
}
