import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getAllEntries, createEntry, emitEvent } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  const entries = await getAllEntries();

  const params = req.nextUrl.searchParams;
  const status = params.get('status');
  const category = params.get('category');
  const entryType = params.get('entryType');
  const limit = parseInt(params.get('limit') || '0', 10);
  const offset = parseInt(params.get('offset') || '0', 10);

  let filtered = entries;

  if (status) {
    filtered = filtered.filter((e) => e.status === status);
  }
  if (category) {
    filtered = filtered.filter((e) => e.category === category);
  }
  if (entryType) {
    filtered = filtered.filter((e) => e.entryType === entryType);
  }

  const total = filtered.length;

  if (offset > 0) {
    filtered = filtered.slice(offset);
  }
  if (limit > 0) {
    filtered = filtered.slice(0, limit);
  }

  return NextResponse.json({ entries: filtered, total, limit, offset });
}

export async function POST(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const body = await req.json();
  const { coordinates, ...rest } = body;

  const row = await createEntry({
    ...rest,
    lng: coordinates?.[0] ?? null,
    lat: coordinates?.[1] ?? null,
  });

  await emitEvent('entry.created', { slug: row[0].slug, title: row[0].title });
  return NextResponse.json(row[0], { status: 201 });
}
