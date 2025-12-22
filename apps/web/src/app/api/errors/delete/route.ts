import { NextResponse } from 'next/server';
import { deleteErrors } from '@/app/actions/errors';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const orgId = body?.orgId;
  const ids = body?.ids;

  if (!orgId || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ success: false, error: 'orgId and ids required' }, { status: 400 });
  }

  const result = await deleteErrors({ orgId, ids });
  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
