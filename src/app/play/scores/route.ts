import { NextRequest, NextResponse } from 'next/server';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sseEvents } from '@/lib/db/schema';

export async function GET() {
  try {
    const rows = await db.select({ payload: sseEvents.payload }).from(sseEvents)
      .where(eq(sseEvents.type, 'snake_score'))
      .orderBy(sql`(${sseEvents.payload}->>'score')::integer desc`, desc(sseEvents.createdAt)).limit(15);
    return NextResponse.json({ scores: rows.map(row => {
      const value = row.payload as { nickname: string; score: number };
      return { nickname: value.nickname, score: value.score };
    }) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Could not load high scores.' }, { status: 503 }); }
}

export async function POST(req: NextRequest) {
  if (req.headers.get('origin') !== req.nextUrl.origin) return NextResponse.json({ error: 'Please submit from Play.' }, { status: 403 });
  try {
    if (Number(req.headers.get('content-length') || 0) > 2048) return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 });
    const value = await req.json();
    const nickname = typeof value.nickname === 'string' ? value.nickname.trim().replace(/\s+/g, ' ') : '';
    if (!nickname || nickname.length > 24 || /[\u0000-\u001f\u007f]/.test(nickname) || !Number.isInteger(value.score) || value.score < 1 || value.score > 420 || typeof value.runId !== 'string' || !/^[a-f0-9-]{36}$/.test(value.runId)) {
      return NextResponse.json({ error: 'Use a nickname of 1–24 characters and a completed game score.' }, { status: 400 });
    }
    // A retry of the same completed run must not add another leaderboard row.
    await db.execute(sql`insert into sse_events (type, payload) select 'snake_score', ${JSON.stringify({ nickname, score: value.score, runId: value.runId })}::jsonb where not exists (select 1 from sse_events where type = 'snake_score' and payload->>'runId' = ${value.runId})`);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Could not save your score. Please try again.' }, { status: 503 }); }
}
