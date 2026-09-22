import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { requireApiKey } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { sseEvents } from '@/lib/db/schema';

export async function GET(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const rows = await db
    .select({
      id: sseEvents.id,
      payload: sseEvents.payload,
      createdAt: sseEvents.createdAt,
    })
    .from(sseEvents)
    .where(eq(sseEvents.type, 'borrow_request'))
    .orderBy(desc(sseEvents.createdAt))
    .limit(100);

  return NextResponse.json({
    count: rows.length,
    requests: rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      ...(row.payload as Record<string, unknown>),
    })),
  });
}
