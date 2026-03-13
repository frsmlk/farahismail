import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getEntryBySlug, updateEntry, deleteEntry, emitEvent } from '@/lib/db/queries';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { slug } = await params;
  const body = await req.json();
  const { coordinates, ...rest } = body;

  const data: Record<string, unknown> = { ...rest };
  if (coordinates) {
    data.lng = coordinates[0];
    data.lat = coordinates[1];
  }

  const rows = await updateEntry(slug, data);
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await emitEvent('entry.updated', { slug });
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { slug } = await params;
  const rows = await deleteEntry(slug);
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await emitEvent('entry.deleted', { slug });
  return NextResponse.json({ deleted: true });
}
