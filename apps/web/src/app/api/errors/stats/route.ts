import { NextResponse } from 'next/server';
import { getErrorStats } from '@/app/actions/errors';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ success: false, error: 'orgId required' }, { status: 400 });

  const result = await getErrorStats({ orgId });
  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
