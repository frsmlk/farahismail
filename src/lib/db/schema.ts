import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  real,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const entryTypeEnum = pgEnum('entry_type', [
  'project',
  'job',
  'education',
  'milestone',
]);

export const categoryEnum = pgEnum('category', [
  'Residential',
  'Urban Planning',
  'Interior Design',
  'Art Direction',
  'Modelling',
  'Artworks',
  'Hospitality',
  'Set Design',
  'Furniture',
  'Landscape',
]);

export const statusEnum = pgEnum('entry_status', [
  'complete',
  'ongoing',
  'paused',
]);

export const updateTypeEnum = pgEnum('update_type', [
  'note',
  'milestone',
  'photo',
  'thought',
]);

export const mediaTypeEnum = pgEnum('media_type', [
  'sketch',
  'photo',
  'render',
  'document',
  'audio',
]);

// ─── Profiles ────────────────────────────────────────────────────────────────

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  headline: text('headline').notNull(),
  bio: text('bio').notNull(),
  roles: text('roles').array().notNull(),
  email: text('email').notNull(),
  website: text('website').notNull().default(''),
  instagram: text('instagram').notNull().default(''),
  linkedin: text('linkedin').notNull().default(''),
  location: text('location').notNull(),
  nationality: text('nationality').notNull(),
  basedIn: text('based_in').notNull(),
  isOnline: boolean('is_online').notNull().default(false),
  currentActivity: text('current_activity').notNull().default(''),
  lastSeen: timestamp('last_seen', { withTimezone: true }),
});

// ─── Archive Entries ─────────────────────────────────────────────────────────

export const archiveEntries = pgTable('archive_entries', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  year: integer('year').notNull(),
  endYear: integer('end_year'),
  entryType: entryTypeEnum('entry_type').notNull(),
  category: categoryEnum('category').notNull(),
  typology: text('typology'),
  organization: text('organization'),
  role: text('role'),
  location: text('location'),
  duration: text('duration'),
  description: text('description').notNull(),
  notes: text('notes'),
  client: text('client'),
  collaborators: text('collaborators').array(),
  tools: text('tools').array(),
  tags: text('tags').array().notNull(),
  status: statusEnum('status').notNull().default('ongoing'),
  lng: real('lng'),
  lat: real('lat'),
  thumbnailUrl: text('thumbnail_url'),
});

// ─── Timeline Updates ────────────────────────────────────────────────────────

export const timelineUpdates = pgTable('timeline_updates', {
  id: serial('id').primaryKey(),
  entryId: integer('entry_id')
    .notNull()
    .references(() => archiveEntries.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // ISO date string
  text: text('text').notNull(),
  type: updateTypeEnum('type').notNull(),
});

// ─── Media Items ─────────────────────────────────────────────────────────────

export const mediaItems = pgTable('media_items', {
  id: serial('id').primaryKey(),
  entryId: integer('entry_id')
    .notNull()
    .references(() => archiveEntries.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  caption: text('caption'),
  mediaType: mediaTypeEnum('media_type').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});
