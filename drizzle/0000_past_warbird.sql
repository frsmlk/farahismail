CREATE TYPE "public"."category" AS ENUM('Residential', 'Urban Planning', 'Interior Design', 'Art Direction', 'Modelling', 'Artworks', 'Hospitality', 'Set Design', 'Furniture', 'Landscape');--> statement-breakpoint
CREATE TYPE "public"."entry_type" AS ENUM('project', 'job', 'education', 'milestone');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('sketch', 'photo', 'render', 'document', 'audio');--> statement-breakpoint
CREATE TYPE "public"."entry_status" AS ENUM('complete', 'ongoing', 'paused');--> statement-breakpoint
CREATE TYPE "public"."update_type" AS ENUM('note', 'milestone', 'photo', 'thought');--> statement-breakpoint
CREATE TABLE "archive_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"year" integer NOT NULL,
	"end_year" integer,
	"entry_type" "entry_type" NOT NULL,
	"category" "category" NOT NULL,
	"typology" text,
	"organization" text,
	"role" text,
	"location" text,
	"duration" text,
	"description" text NOT NULL,
	"notes" text,
	"client" text,
	"collaborators" text[],
	"tools" text[],
	"tags" text[] NOT NULL,
	"status" "entry_status" DEFAULT 'ongoing' NOT NULL,
	"lng" real,
	"lat" real,
	"thumbnail_url" text,
	CONSTRAINT "archive_entries_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"url" text NOT NULL,
	"caption" text,
	"media_type" "media_type" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"headline" text NOT NULL,
	"bio" text NOT NULL,
	"roles" text[] NOT NULL,
	"email" text NOT NULL,
	"website" text DEFAULT '' NOT NULL,
	"instagram" text DEFAULT '' NOT NULL,
	"linkedin" text DEFAULT '' NOT NULL,
	"location" text NOT NULL,
	"nationality" text NOT NULL,
	"based_in" text NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"current_activity" text DEFAULT '' NOT NULL,
	"last_seen" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sse_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"date" text NOT NULL,
	"text" text NOT NULL,
	"type" "update_type" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "media_items" ADD CONSTRAINT "media_items_entry_id_archive_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."archive_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_updates" ADD CONSTRAINT "timeline_updates_entry_id_archive_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."archive_entries"("id") ON DELETE cascade ON UPDATE no action;