import { NextResponse } from 'next/server';
import { getErrorDetails } from '@/app/actions/errors';

type Params = { params: { id: string } };

export async function GET(req: Request, { params }: Params) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ success: false, error: 'orgId required' }, { status: 400 });

  const result = await getErrorDetails({ orgId, id: params.id });
  if (!result.success) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
