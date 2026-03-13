import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { archiveEntries, timelineUpdates } from '@/lib/db/schema';
import { sql, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) {
    return NextResponse.json({ error: 'Missing ?q= parameter' }, { status: 400 });
  }

  const pattern = `%${q}%`;

  // Search entries by title, slug, tags, location, client, description
  const entries = await db
    .select({
      id: archiveEntries.id,
      title: archiveEntries.title,
      slug: archiveEntries.slug,
      year: archiveEntries.year,
      category: archiveEntries.category,
      status: archiveEntries.status,
      location: archiveEntries.location,
      tags: archiveEntries.tags,
    })
    .from(archiveEntries)
    .where(
      sql`(
        ${archiveEntries.title} ilike ${pattern}
        or ${archiveEntries.slug} ilike ${pattern}
        or ${archiveEntries.location} ilike ${pattern}
        or ${archiveEntries.client} ilike ${pattern}
        or ${archiveEntries.description} ilike ${pattern}
        or array_to_string(${archiveEntries.tags}, ' ') ilike ${pattern}
      )`
    )
    .orderBy(desc(archiveEntries.year))
    .limit(10);

  // Search timeline updates by text
  const updates = await db
    .select({
      id: timelineUpdates.id,
      date: timelineUpdates.date,
      text: timelineUpdates.text,
      type: timelineUpdates.type,
      entryTitle: archiveEntries.title,
      entrySlug: archiveEntries.slug,
    })
    .from(timelineUpdates)
    .innerJoin(archiveEntries, sql`${timelineUpdates.entryId} = ${archiveEntries.id}`)
    .where(sql`${timelineUpdates.text} ilike ${pattern}`)
    .orderBy(desc(timelineUpdates.date))
    .limit(10);

  return NextResponse.json({ entries, updates });
}
