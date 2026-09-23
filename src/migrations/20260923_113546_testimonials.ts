import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { convertInlineTestimonials } from '../utilities/convertInlineTestimonials'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_testimonials_mode" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_tag_match" AS ENUM('any', 'all');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_mode" AS ENUM('auto', 'manual');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_tag_match" AS ENUM('any', 'all');
  CREATE TYPE "public"."enum_testimonials_link_type" AS ENUM('none', 'internal', 'external');
  CREATE TYPE "public"."enum_testimonials_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_version_link_type" AS ENUM('none', 'internal', 'external');
  CREATE TYPE "public"."enum__testimonials_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__testimonials_v_published_locale" AS ENUM('de', 'en');
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"name" varchar,
  	"company" varchar,
  	"avatar_id" integer,
  	"logo_id" integer,
  	"link_type" "enum_testimonials_link_type" DEFAULT 'none',
  	"link_url" varchar,
  	"approved_until" timestamp(3) with time zone,
  	"internal_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_testimonials_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "testimonials_locales" (
  	"quote" varchar,
  	"role" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"testimonial_tags_id" integer,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "_testimonials_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_name" varchar,
  	"version_company" varchar,
  	"version_avatar_id" integer,
  	"version_logo_id" integer,
  	"version_link_type" "enum__testimonials_v_version_link_type" DEFAULT 'none',
  	"version_link_url" varchar,
  	"version_approved_until" timestamp(3) with time zone,
  	"version_internal_note" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__testimonials_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__testimonials_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_testimonials_v_locales" (
  	"version_quote" varchar,
  	"version_role" varchar,
  	"version_link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_testimonials_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"testimonial_tags_id" integer,
  	"pages_id" integer,
  	"posts_id" integer
  );
  
  CREATE TABLE "testimonial_tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonial_tags_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "mode" "enum_pages_blocks_testimonials_mode" DEFAULT 'auto';
  ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "tag_match" "enum_pages_blocks_testimonials_tag_match" DEFAULT 'any';
  ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "count" numeric DEFAULT 3;
  ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "seed" varchar;
  ALTER TABLE "pages_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "pages_rels" ADD COLUMN "testimonial_tags_id" integer;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN "mode" "enum__pages_v_blocks_testimonials_mode" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN "tag_match" "enum__pages_v_blocks_testimonials_tag_match" DEFAULT 'any';
  ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN "count" numeric DEFAULT 3;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN "seed" varchar;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "testimonial_tags_id" integer;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "testimonials_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "testimonials_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "testimonials_update" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "testimonial_tags_find" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "testimonial_tags_create" boolean DEFAULT false;
  ALTER TABLE "payload_mcp_api_keys" ADD COLUMN "testimonial_tags_update" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonials_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "testimonial_tags_id" integer;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_rels" ADD CONSTRAINT "testimonials_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_rels" ADD CONSTRAINT "testimonials_rels_testimonial_tags_fk" FOREIGN KEY ("testimonial_tags_id") REFERENCES "public"."testimonial_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_rels" ADD CONSTRAINT "testimonials_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_rels" ADD CONSTRAINT "testimonials_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_parent_id_testimonials_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."testimonials"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_avatar_id_media_id_fk" FOREIGN KEY ("version_avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v" ADD CONSTRAINT "_testimonials_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_testimonials_v_locales" ADD CONSTRAINT "_testimonials_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_testimonials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v_rels" ADD CONSTRAINT "_testimonials_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_testimonials_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v_rels" ADD CONSTRAINT "_testimonials_v_rels_testimonial_tags_fk" FOREIGN KEY ("testimonial_tags_id") REFERENCES "public"."testimonial_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v_rels" ADD CONSTRAINT "_testimonials_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_testimonials_v_rels" ADD CONSTRAINT "_testimonials_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonial_tags_locales" ADD CONSTRAINT "testimonial_tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonial_tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "testimonials_avatar_idx" ON "testimonials" USING btree ("avatar_id");
  CREATE INDEX "testimonials_logo_idx" ON "testimonials" USING btree ("logo_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE INDEX "testimonials__status_idx" ON "testimonials" USING btree ("_status");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_rels_order_idx" ON "testimonials_rels" USING btree ("order");
  CREATE INDEX "testimonials_rels_parent_idx" ON "testimonials_rels" USING btree ("parent_id");
  CREATE INDEX "testimonials_rels_path_idx" ON "testimonials_rels" USING btree ("path");
  CREATE INDEX "testimonials_rels_testimonial_tags_id_idx" ON "testimonials_rels" USING btree ("testimonial_tags_id");
  CREATE INDEX "testimonials_rels_pages_id_idx" ON "testimonials_rels" USING btree ("pages_id");
  CREATE INDEX "testimonials_rels_posts_id_idx" ON "testimonials_rels" USING btree ("posts_id");
  CREATE INDEX "_testimonials_v_parent_idx" ON "_testimonials_v" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_version_version_avatar_idx" ON "_testimonials_v" USING btree ("version_avatar_id");
  CREATE INDEX "_testimonials_v_version_version_logo_idx" ON "_testimonials_v" USING btree ("version_logo_id");
  CREATE INDEX "_testimonials_v_version_version_updated_at_idx" ON "_testimonials_v" USING btree ("version_updated_at");
  CREATE INDEX "_testimonials_v_version_version_created_at_idx" ON "_testimonials_v" USING btree ("version_created_at");
  CREATE INDEX "_testimonials_v_version_version__status_idx" ON "_testimonials_v" USING btree ("version__status");
  CREATE INDEX "_testimonials_v_created_at_idx" ON "_testimonials_v" USING btree ("created_at");
  CREATE INDEX "_testimonials_v_updated_at_idx" ON "_testimonials_v" USING btree ("updated_at");
  CREATE INDEX "_testimonials_v_snapshot_idx" ON "_testimonials_v" USING btree ("snapshot");
  CREATE INDEX "_testimonials_v_published_locale_idx" ON "_testimonials_v" USING btree ("published_locale");
  CREATE INDEX "_testimonials_v_latest_idx" ON "_testimonials_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_testimonials_v_locales_locale_parent_id_unique" ON "_testimonials_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_testimonials_v_rels_order_idx" ON "_testimonials_v_rels" USING btree ("order");
  CREATE INDEX "_testimonials_v_rels_parent_idx" ON "_testimonials_v_rels" USING btree ("parent_id");
  CREATE INDEX "_testimonials_v_rels_path_idx" ON "_testimonials_v_rels" USING btree ("path");
  CREATE INDEX "_testimonials_v_rels_testimonial_tags_id_idx" ON "_testimonials_v_rels" USING btree ("testimonial_tags_id");
  CREATE INDEX "_testimonials_v_rels_pages_id_idx" ON "_testimonials_v_rels" USING btree ("pages_id");
  CREATE INDEX "_testimonials_v_rels_posts_id_idx" ON "_testimonials_v_rels" USING btree ("posts_id");
  CREATE UNIQUE INDEX "testimonial_tags_slug_idx" ON "testimonial_tags" USING btree ("slug");
  CREATE INDEX "testimonial_tags_updated_at_idx" ON "testimonial_tags" USING btree ("updated_at");
  CREATE INDEX "testimonial_tags_created_at_idx" ON "testimonial_tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "testimonial_tags_locales_locale_parent_id_unique" ON "testimonial_tags_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_testimonial_tags_fk" FOREIGN KEY ("testimonial_tags_id") REFERENCES "public"."testimonial_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_testimonial_tags_fk" FOREIGN KEY ("testimonial_tags_id") REFERENCES "public"."testimonial_tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonial_tags_fk" FOREIGN KEY ("testimonial_tags_id") REFERENCES "public"."testimonial_tags"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_testimonials_id_idx" ON "pages_rels" USING btree ("testimonials_id");
  CREATE INDEX "pages_rels_testimonial_tags_id_idx" ON "pages_rels" USING btree ("testimonial_tags_id");
  CREATE INDEX "_pages_v_rels_testimonials_id_idx" ON "_pages_v_rels" USING btree ("testimonials_id");
  CREATE INDEX "_pages_v_rels_testimonial_tags_id_idx" ON "_pages_v_rels" USING btree ("testimonial_tags_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_locked_documents_rels_testimonial_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonial_tags_id");`)

  // Move the inline quotes of existing blocks into the new collection (idempotent) and turn blocks
  // without quotes into empty manual blocks (the new column defaults would make them auto blocks).
  // It gets the migration's own req, so every save runs in this migration's transaction. It runs
  // when there are inline quotes or blocks from before this migration (no seed yet); a database
  // with neither (a fresh install) skips it: the converter reads pages through the current config,
  // which may already expect columns that later migrations add.
  const legacy = await db.execute(sql`
    SELECT 1 FROM "pages_blocks_testimonials_items"
    UNION ALL SELECT 1 FROM "pages_blocks_testimonials" WHERE "seed" IS NULL
    LIMIT 1`)
  if (legacy.rows.length === 0) {
    payload.logger.info('[testimonials] no inline quotes or legacy blocks to convert')
    return
  }
  const result = await convertInlineTestimonials({ payload, req })
  payload.logger.info(
    `[testimonials] created ${result.created}, reused ${result.reused}, converted ${result.blocks} published and ${result.draftBlocks} draft blocks, kept ${result.emptyBlocks} published and ${result.emptyDraftBlocks} draft blocks without quotes empty`,
  )
  // Draft blocks with pending edits keep their inline quotes; an editor converts them by hand.
  for (const item of result.needsReview) {
    payload.logger.warn(`[testimonials] needs review: page ${item.pageId}, block ${item.blockId}: ${item.reason}`)
  }
}

// Schema only, and it keeps content: the conversion leaves the blocks' inline quotes in place,
// so after a down (or with the previous image) the pages render them again. What goes are the
// testimonials and tags themselves and the block references to them.
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_testimonials_fk";
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_testimonial_tags_fk";
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_testimonials_fk";
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_testimonial_tags_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonials_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_testimonial_tags_fk";
  -- Relationship rows that pointed at testimonials or tags would be left with no target.
  DELETE FROM "pages_rels" WHERE "testimonials_id" IS NOT NULL OR "testimonial_tags_id" IS NOT NULL;
  DELETE FROM "_pages_v_rels" WHERE "testimonials_id" IS NOT NULL OR "testimonial_tags_id" IS NOT NULL;
  DELETE FROM "payload_locked_documents_rels" WHERE "testimonials_id" IS NOT NULL OR "testimonial_tags_id" IS NOT NULL;
  ALTER TABLE "testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonials_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_testimonials_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonial_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "testimonial_tags_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "testimonials_rels" CASCADE;
  DROP TABLE "_testimonials_v" CASCADE;
  DROP TABLE "_testimonials_v_locales" CASCADE;
  DROP TABLE "_testimonials_v_rels" CASCADE;
  DROP TABLE "testimonial_tags" CASCADE;
  DROP TABLE "testimonial_tags_locales" CASCADE;
  DROP INDEX "pages_rels_testimonials_id_idx";
  DROP INDEX "pages_rels_testimonial_tags_id_idx";
  DROP INDEX "_pages_v_rels_testimonials_id_idx";
  DROP INDEX "_pages_v_rels_testimonial_tags_id_idx";
  DROP INDEX "payload_locked_documents_rels_testimonials_id_idx";
  DROP INDEX "payload_locked_documents_rels_testimonial_tags_id_idx";
  ALTER TABLE "pages_blocks_testimonials" DROP COLUMN "mode";
  ALTER TABLE "pages_blocks_testimonials" DROP COLUMN "tag_match";
  ALTER TABLE "pages_blocks_testimonials" DROP COLUMN "count";
  ALTER TABLE "pages_blocks_testimonials" DROP COLUMN "seed";
  ALTER TABLE "pages_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "pages_rels" DROP COLUMN "testimonial_tags_id";
  ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN "mode";
  ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN "tag_match";
  ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN "count";
  ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN "seed";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "testimonial_tags_id";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "testimonials_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "testimonials_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "testimonials_update";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "testimonial_tags_find";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "testimonial_tags_create";
  ALTER TABLE "payload_mcp_api_keys" DROP COLUMN "testimonial_tags_update";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonials_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "testimonial_tags_id";
  DROP TYPE "public"."enum_pages_blocks_testimonials_mode";
  DROP TYPE "public"."enum_pages_blocks_testimonials_tag_match";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_mode";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_tag_match";
  DROP TYPE "public"."enum_testimonials_link_type";
  DROP TYPE "public"."enum_testimonials_status";
  DROP TYPE "public"."enum__testimonials_v_version_link_type";
  DROP TYPE "public"."enum__testimonials_v_version_status";
  DROP TYPE "public"."enum__testimonials_v_published_locale";`)
}
