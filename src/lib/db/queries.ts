import { eq, desc, asc, ilike, inArray, gte, lte, sql } from 'drizzle-orm';
import { db } from './index';
import {
  profiles,
  archiveEntries,
  timelineUpdates,
  mediaItems,
} from './schema';
import type { ArchiveEntry, Profile, Status, TimelineUpdate, MediaItem } from '@/lib/types';

// ─── Helpers: DB row → app types ─────────────────────────────────────────────

function rowToEntry(
  row: typeof archiveEntries.$inferSelect,
  updates: (typeof timelineUpdates.$inferSelect)[] = [],
  media: (typeof mediaItems.$inferSelect)[] = [],
): ArchiveEntry {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    year: row.year,
    endYear: row.endYear ?? undefined,
    entryType: row.entryType,
    category: row.category,
    typology: row.typology ?? undefined,
    organization: row.organization ?? undefined,
    role: row.role ?? undefined,
    location: row.location ?? undefined,
    duration: row.duration ?? undefined,
    description: row.description,
    notes: row.notes ?? undefined,
    client: row.client ?? undefined,
    collaborators: row.collaborators ?? undefined,
    tools: row.tools ?? undefined,
    tags: row.tags,
    status: row.status,
    coordinates: row.lng != null && row.lat != null ? [row.lng, row.lat] : undefined,
    thumbnailUrl: row.thumbnailUrl ?? undefined,
    updates: updates.length > 0
      ? updates.map((u) => ({ date: u.date, text: u.text, type: u.type }))
      : undefined,
    media: media.length > 0
      ? media.map((m) => ({
          id: m.id,
          url: m.url,
          caption: m.caption ?? undefined,
          mediaType: m.mediaType,
          sortOrder: m.sortOrder,
        }))
      : undefined,
  };
}

function rowToProfile(row: typeof profiles.$inferSelect): Profile & Status {
  return {
    fullName: row.fullName,
    headline: row.headline,
    bio: row.bio,
    roles: row.roles,
    email: row.email,
    website: row.website,
    instagram: row.instagram,
    linkedin: row.linkedin,
    location: row.location,
    nationality: row.nationality,
    basedIn: row.basedIn,
    isOnline: row.isOnline,
    currentActivity: row.currentActivity,
    lastSeen: row.lastSeen?.toISOString() ?? '',
  };
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<(Profile & Status) | null> {
  const rows = await db.select().from(profiles).limit(1);
  if (rows.length === 0) return null;
  return rowToProfile(rows[0]);
}

export async function updateProfile(
  data: Partial<Omit<typeof profiles.$inferInsert, 'id'>>,
) {
  const rows = await db.select({ id: profiles.id }).from(profiles).limit(1);
  if (rows.length === 0) {
    return db.insert(profiles).values(data as typeof profiles.$inferInsert).returning();
  }
  return db.update(profiles).set(data).where(eq(profiles.id, rows[0].id)).returning();
}

// ─── Archive Entries ─────────────────────────────────────────────────────────

export async function getAllEntries(): Promise<ArchiveEntry[]> {
  const rows = await db.select().from(archiveEntries).orderBy(desc(archiveEntries.year));
  const entryIds = rows.map((r) => r.id);

  if (entryIds.length === 0) return [];

  const [allUpdates, allMedia] = await Promise.all([
    db.select().from(timelineUpdates).where(inArray(timelineUpdates.entryId, entryIds)),
    db.select().from(mediaItems).where(inArray(mediaItems.entryId, entryIds)),
  ]);

  const updatesByEntry = new Map<number, (typeof timelineUpdates.$inferSelect)[]>();
  for (const u of allUpdates) {
    const arr = updatesByEntry.get(u.entryId) ?? [];
    arr.push(u);
    updatesByEntry.set(u.entryId, arr);
  }

  const mediaByEntry = new Map<number, (typeof mediaItems.$inferSelect)[]>();
  for (const m of allMedia) {
    const arr = mediaByEntry.get(m.entryId) ?? [];
    arr.push(m);
    mediaByEntry.set(m.entryId, arr);
  }

  return rows.map((row) =>
    rowToEntry(
      row,
      updatesByEntry.get(row.id) ?? [],
      mediaByEntry.get(row.id) ?? [],
    ),
  );
}

export async function getEntryBySlug(slug: string): Promise<ArchiveEntry | null> {
  const rows = await db
    .select()
    .from(archiveEntries)
    .where(eq(archiveEntries.slug, slug))
    .limit(1);

  if (rows.length === 0) return null;

  const row = rows[0];
  const [updates, media] = await Promise.all([
    db.select().from(timelineUpdates).where(eq(timelineUpdates.entryId, row.id)),
    db.select().from(mediaItems).where(eq(mediaItems.entryId, row.id)).orderBy(asc(mediaItems.sortOrder)),
  ]);

  return rowToEntry(row, updates, media);
}

export async function createEntry(
  data: typeof archiveEntries.$inferInsert,
) {
  return db.insert(archiveEntries).values(data).returning();
}

export async function updateEntry(
  slug: string,
  data: Partial<Omit<typeof archiveEntries.$inferInsert, 'id' | 'slug'>>,
) {
  return db
    .update(archiveEntries)
    .set(data)
    .where(eq(archiveEntries.slug, slug))
    .returning();
}

export async function deleteEntry(slug: string) {
  return db.delete(archiveEntries).where(eq(archiveEntries.slug, slug)).returning();
}

// ─── Timeline Updates ────────────────────────────────────────────────────────

export async function getUpdatesForEntry(slug: string) {
  const entry = await db
    .select({ id: archiveEntries.id })
    .from(archiveEntries)
    .where(eq(archiveEntries.slug, slug))
    .limit(1);

  if (entry.length === 0) return [];

  return db
    .select()
    .from(timelineUpdates)
    .where(eq(timelineUpdates.entryId, entry[0].id))
    .orderBy(desc(timelineUpdates.date));
}

export async function addUpdate(
  slug: string,
  data: { date: string; text: string; type: 'note' | 'milestone' | 'photo' | 'thought' },
) {
  const entry = await db
    .select({ id: archiveEntries.id })
    .from(archiveEntries)
    .where(eq(archiveEntries.slug, slug))
    .limit(1);

  if (entry.length === 0) return null;

  return db
    .insert(timelineUpdates)
    .values({ entryId: entry[0].id, ...data })
    .returning();
}

export async function deleteUpdate(id: number) {
  return db.delete(timelineUpdates).where(eq(timelineUpdates.id, id)).returning();
}

// ─── Media Items ─────────────────────────────────────────────────────────────

export async function getMediaForEntry(slug: string) {
  const entry = await db
    .select({ id: archiveEntries.id })
    .from(archiveEntries)
    .where(eq(archiveEntries.slug, slug))
    .limit(1);

  if (entry.length === 0) return [];

  return db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.entryId, entry[0].id))
    .orderBy(asc(mediaItems.sortOrder));
}

export async function addMedia(
  slug: string,
  data: { url: string; caption?: string; mediaType: 'sketch' | 'photo' | 'render' | 'document'; sortOrder?: number },
) {
  const entry = await db
    .select({ id: archiveEntries.id })
    .from(archiveEntries)
    .where(eq(archiveEntries.slug, slug))
    .limit(1);

  if (entry.length === 0) return null;

  return db
    .insert(mediaItems)
    .values({
      entryId: entry[0].id,
      url: data.url,
      caption: data.caption,
      mediaType: data.mediaType,
      sortOrder: data.sortOrder ?? 0,
    })
    .returning();
}

export async function deleteMedia(id: number) {
  return db.delete(mediaItems).where(eq(mediaItems.id, id)).returning();
}
