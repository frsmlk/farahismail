import { NextRequest, NextResponse } from 'next/server';

export function requireApiKey(req: NextRequest): NextResponse | null {
  const header = req.headers.get('authorization');
  const token = header?.replace('Bearer ', '');
  const expected = process.env.API_KEY;

  if (!expected) {
    return NextResponse.json({ error: 'API_KEY not configured' }, { status: 500 });
  }

  if (!token || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // auth passed
}
