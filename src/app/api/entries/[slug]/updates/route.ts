import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getUpdatesForEntry, addUpdate } from '@/lib/db/queries';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const updates = await getUpdatesForEntry(slug);
  return NextResponse.json(updates);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { slug } = await params;
  const body = await req.json();
  const result = await addUpdate(slug, body);

  if (!result) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  return NextResponse.json(result[0], { status: 201 });
}
