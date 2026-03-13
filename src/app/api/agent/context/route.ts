import { NextRequest, NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { archiveEntries, profiles, timelineUpdates } from '@/lib/db/schema';
import { desc, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const [entries, profileRows, recentUpdates, stats] = await Promise.all([
    // All entries — summary only (no full description/updates)
    db
      .select({
        id: archiveEntries.id,
        title: archiveEntries.title,
        slug: archiveEntries.slug,
        year: archiveEntries.year,
        endYear: archiveEntries.endYear,
        entryType: archiveEntries.entryType,
        category: archiveEntries.category,
        status: archiveEntries.status,
        location: archiveEntries.location,
        client: archiveEntries.client,
        tags: archiveEntries.tags,
      })
      .from(archiveEntries)
      .orderBy(desc(archiveEntries.year)),

    // Profile
    db.select().from(profiles).limit(1),

    // 10 most recent timeline updates across all entries
    db
      .select({
        id: timelineUpdates.id,
        entryId: timelineUpdates.entryId,
        date: timelineUpdates.date,
        text: timelineUpdates.text,
        type: timelineUpdates.type,
        entryTitle: archiveEntries.title,
        entrySlug: archiveEntries.slug,
      })
      .from(timelineUpdates)
      .innerJoin(archiveEntries, sql`${timelineUpdates.entryId} = ${archiveEntries.id}`)
      .orderBy(desc(timelineUpdates.date))
      .limit(10),

    // Aggregate stats
    db
      .select({
        totalEntries: sql<number>`count(*)`,
        ongoingCount: sql<number>`count(*) filter (where ${archiveEntries.status} = 'ongoing')`,
        completeCount: sql<number>`count(*) filter (where ${archiveEntries.status} = 'complete')`,
        pausedCount: sql<number>`count(*) filter (where ${archiveEntries.status} = 'paused')`,
        minYear: sql<number>`min(${archiveEntries.year})`,
        maxYear: sql<number>`max(${archiveEntries.year})`,
      })
      .from(archiveEntries),
  ]);

  // Category breakdown
  const categoryCounts: Record<string, number> = {};
  for (const e of entries) {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  }

  return NextResponse.json({
    entries,
    profile: profileRows[0] ?? null,
    recentUpdates,
    stats: {
      ...stats[0],
      categories: categoryCounts,
    },
  });
}
