import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { logUsage } from '@/lib/usage/server';

interface UpdateAvatarPayload {
  userId: string;
  avatarUrl: string;
  fileSize?: number;
  orgId?: string;
}

export async function POST(request: Request) {
  const supabase = createClient({ cookies });
  const { userId, avatarUrl, fileSize, orgId }: UpdateAvatarPayload = await request.json();

  if (!userId || !avatarUrl) {
    return NextResponse.json({ error: 'Missing userId or avatarUrl' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (typeof fileSize === 'number' && fileSize > 0) {
    logUsage({
      userId,
      orgId,
      eventType: 'storage_used',
      quantity: fileSize,
      metadata: {
        avatarUrl,
      },
    }).catch(() => {
      // best-effort logging
    });
  }

  return NextResponse.json({ data });
}
