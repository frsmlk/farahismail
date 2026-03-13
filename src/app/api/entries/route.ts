import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getAllEntries, createEntry } from '@/lib/db/queries';

export async function GET() {
  const entries = await getAllEntries();
  return NextResponse.json(entries);
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

  return NextResponse.json(row[0], { status: 201 });
}
