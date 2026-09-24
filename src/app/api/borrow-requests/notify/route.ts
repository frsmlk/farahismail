import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { sseEvents } from '@/lib/db/schema';

const NOTIFY_TOKEN = process.env.BOOK_CLUB_NOTIFY_TOKEN ?? 'd5de61bf3a84659c22b8a3981924e62d80e8e8a55b16da23e52df1188839e7e3';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token || token !== NOTIFY_TOKEN) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (req.nextUrl.searchParams.get('action') === 'delete') {
    return deleteBorrowRequest(req);
  }

  const rows = await db
    .select({
      id: sseEvents.id,
      payload: sseEvents.payload,
      createdAt: sseEvents.createdAt,
    })
    .from(sseEvents)
    .where(eq(sseEvents.type, 'borrow_request'))
    .orderBy(desc(sseEvents.createdAt))
    .limit(20);

  return NextResponse.json({
    count: rows.length,
    requests: rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt,
      ...(row.payload as Record<string, unknown>),
    })),
  });
}

async function deleteBorrowRequest(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token || token !== NOTIFY_TOKEN) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const id = Number(req.nextUrl.searchParams.get('id'));

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const deleted = await db
    .delete(sseEvents)
    .where(and(eq(sseEvents.id, id), eq(sseEvents.type, 'borrow_request')))
    .returning({ id: sseEvents.id });

  return NextResponse.json({ deleted: deleted.length, id });
}

export async function POST(req: NextRequest) {
  return deleteBorrowRequest(req);
}

export async function DELETE(req: NextRequest) {
  return deleteBorrowRequest(req);
}
