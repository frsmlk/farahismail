import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { getProfile, updateProfile } from '@/lib/db/queries';

export async function GET() {
  const profile = await getProfile();
  if (!profile) return NextResponse.json({ error: 'No profile found' }, { status: 404 });
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const body = await req.json();
  const rows = await updateProfile(body);
  return NextResponse.json(rows[0]);
}
