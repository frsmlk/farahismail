import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { updateUpdate, deleteUpdate } from '@/lib/db/queries';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { id } = await params;
  const updateId = parseInt(id, 10);
  if (isNaN(updateId)) return NextResponse.json({ error: 'Invalid update ID' }, { status: 400 });

  const body = await req.json();
  const rows = await updateUpdate(updateId, body);
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> },
) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { id } = await params;
  const updateId = parseInt(id, 10);
  if (isNaN(updateId)) return NextResponse.json({ error: 'Invalid update ID' }, { status: 400 });

  const rows = await deleteUpdate(updateId);
  if (rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
