import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { reorderMedia, emitEvent } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const body = await req.json();
  const { items } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: 'Expected { items: [{ id: number, sortOrder: number }, ...] }' },
      { status: 400 },
    );
  }

  const results = await reorderMedia(items);
  await emitEvent('media.reordered', { count: items.length });
  return NextResponse.json(results);
}
