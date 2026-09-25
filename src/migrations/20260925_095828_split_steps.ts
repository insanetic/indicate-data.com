import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { convertStepSections } from '../sections/convertPages'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_split_points_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum_pages_blocks_split_points_visual_illustration" AS ENUM('stage', 'resiHub', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum_pages_blocks_split_point_style" AS ENUM('points', 'steps');
  CREATE TYPE "public"."enum__pages_v_blocks_split_points_visual_type" AS ENUM('illustration', 'image');
  CREATE TYPE "public"."enum__pages_v_blocks_split_points_visual_illustration" AS ENUM('stage', 'resiHub', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  CREATE TYPE "public"."enum__pages_v_blocks_split_point_style" AS ENUM('points', 'steps');
  ALTER TABLE "pages_blocks_split_points" ADD COLUMN "own_visual" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_split_points" ADD COLUMN "visual_type" "enum_pages_blocks_split_points_visual_type" DEFAULT 'illustration';
  ALTER TABLE "pages_blocks_split_points" ADD COLUMN "visual_illustration" "enum_pages_blocks_split_points_visual_illustration" DEFAULT 'dashboard';
  ALTER TABLE "pages_blocks_split_points" ADD COLUMN "visual_image_id" integer;
  ALTER TABLE "pages_blocks_split" ADD COLUMN "point_style" "enum_pages_blocks_split_point_style" DEFAULT 'points';
  ALTER TABLE "_pages_v_blocks_split_points" ADD COLUMN "own_visual" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_split_points" ADD COLUMN "visual_type" "enum__pages_v_blocks_split_points_visual_type" DEFAULT 'illustration';
  ALTER TABLE "_pages_v_blocks_split_points" ADD COLUMN "visual_illustration" "enum__pages_v_blocks_split_points_visual_illustration" DEFAULT 'dashboard';
  ALTER TABLE "_pages_v_blocks_split_points" ADD COLUMN "visual_image_id" integer;
  ALTER TABLE "_pages_v_blocks_split" ADD COLUMN "point_style" "enum__pages_v_blocks_split_point_style" DEFAULT 'points';
  ALTER TABLE "pages_blocks_split_points" ADD CONSTRAINT "pages_blocks_split_points_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_split_points" ADD CONSTRAINT "_pages_v_blocks_split_points_visual_image_id_media_id_fk" FOREIGN KEY ("visual_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_split_points_visual_visual_image_idx" ON "pages_blocks_split_points" USING btree ("visual_image_id");
  CREATE INDEX "_pages_v_blocks_split_points_visual_visual_image_idx" ON "_pages_v_blocks_split_points" USING btree ("visual_image_id");`)

  // Convert the Items "steps" rows into Split blocks in steps mode (idempotent, published and
  // draft states per locale, inside this migration's transaction). A database without pages (a
  // fresh install) skips it: the current config may already expect columns that later migrations add.
  const pages = await db.execute(sql`SELECT 1 FROM "pages" LIMIT 1`)
  if (pages.rows.length === 0) {
    payload.logger.info('[steps] no pages to convert')
    return
  }
  const result = await convertStepSections({ payload, req })
  payload.logger.info(`[steps] converted ${result.publishedPages} published pages and ${result.draftPages} drafts`)
}

// Schema only. The converted steps live in Split blocks, so a down loses them; roll back a deploy
// of this migration by restoring the pre-deploy database backup instead.
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_split_points" DROP CONSTRAINT "pages_blocks_split_points_visual_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_split_points" DROP CONSTRAINT "_pages_v_blocks_split_points_visual_image_id_media_id_fk";
  
  DROP INDEX "pages_blocks_split_points_visual_visual_image_idx";
  DROP INDEX "_pages_v_blocks_split_points_visual_visual_image_idx";
  ALTER TABLE "pages_blocks_split_points" DROP COLUMN "own_visual";
  ALTER TABLE "pages_blocks_split_points" DROP COLUMN "visual_type";
  ALTER TABLE "pages_blocks_split_points" DROP COLUMN "visual_illustration";
  ALTER TABLE "pages_blocks_split_points" DROP COLUMN "visual_image_id";
  ALTER TABLE "pages_blocks_split" DROP COLUMN "point_style";
  ALTER TABLE "_pages_v_blocks_split_points" DROP COLUMN "own_visual";
  ALTER TABLE "_pages_v_blocks_split_points" DROP COLUMN "visual_type";
  ALTER TABLE "_pages_v_blocks_split_points" DROP COLUMN "visual_illustration";
  ALTER TABLE "_pages_v_blocks_split_points" DROP COLUMN "visual_image_id";
  ALTER TABLE "_pages_v_blocks_split" DROP COLUMN "point_style";
  DROP TYPE "public"."enum_pages_blocks_split_points_visual_type";
  DROP TYPE "public"."enum_pages_blocks_split_points_visual_illustration";
  DROP TYPE "public"."enum_pages_blocks_split_point_style";
  DROP TYPE "public"."enum__pages_v_blocks_split_points_visual_type";
  DROP TYPE "public"."enum__pages_v_blocks_split_points_visual_illustration";
  DROP TYPE "public"."enum__pages_v_blocks_split_point_style";`)
}
