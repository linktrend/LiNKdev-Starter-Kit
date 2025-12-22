import { NextResponse } from 'next/server';
import { listErrors } from '@/app/actions/errors';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  if (!orgId) return NextResponse.json({ success: false, error: 'orgId required' }, { status: 400 });

  const severity = searchParams.get('severity') as any;
  const resolvedParam = searchParams.get('resolved');
  const resolved = resolvedParam === null ? undefined : resolvedParam === 'true';
  const userId = searchParams.get('userId') ?? undefined;
  const pageUrl = searchParams.get('pageUrl') ?? undefined;
  const search = searchParams.get('search') ?? undefined;
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;
  const sort = (searchParams.get('sort') ?? 'newest') as any;
  const limit = Number(searchParams.get('limit') ?? 25);
  const offset = Number(searchParams.get('offset') ?? 0);

  const result = await listErrors({
    orgId,
    severity: severity === 'all' ? undefined : severity,
    resolved: resolvedParam === 'all' ? undefined : resolved,
    userId,
    pageUrl,
    search,
    from: from || undefined,
    to: to || undefined,
    sort,
    limit,
    offset,
  } as any);

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
