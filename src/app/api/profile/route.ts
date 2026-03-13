import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getProfile, createProfile, updateProfile } from '@/lib/db/queries';

export async function GET() {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: 'No profile found. POST to create one.' }, { status: 404 });
  return NextResponse.json(profile);
}

export async function POST(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const existing = await getProfile();
  if (existing) {
    return NextResponse.json({ error: 'Profile already exists. Use PATCH to update.' }, { status: 409 });
  }

  const body = await req.json();
  const rows = await createProfile(body);
  return NextResponse.json(rows[0], { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const body = await req.json();
  const rows = await updateProfile(body);
  return NextResponse.json(rows[0]);
}
