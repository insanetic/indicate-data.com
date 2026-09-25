import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_hero_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';
  ALTER TYPE "public"."enum_pages_blocks_media_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';
  ALTER TYPE "public"."enum_pages_blocks_split_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';
  ALTER TYPE "public"."enum_pages_blocks_feature_tabs_tabs_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';
  ALTER TYPE "public"."enum_pages_blocks_feature_story_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';
  ALTER TYPE "public"."enum_pages_blocks_integrations_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';
  ALTER TYPE "public"."enum__pages_v_blocks_hero_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';
  ALTER TYPE "public"."enum__pages_v_blocks_media_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';
  ALTER TYPE "public"."enum__pages_v_blocks_split_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';
  ALTER TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';
  ALTER TYPE "public"."enum__pages_v_blocks_feature_story_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';
  ALTER TYPE "public"."enum__pages_v_blocks_integrations_visual_illustration" ADD VALUE IF NOT EXISTS 'resiHub' BEFORE 'dashboard';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "visual_illustration" SET DEFAULT 'stage'::text;
  DROP TYPE "public"."enum_pages_blocks_hero_visual_illustration";
  CREATE TYPE "public"."enum_pages_blocks_hero_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "visual_illustration" SET DEFAULT 'stage'::"public"."enum_pages_blocks_hero_visual_illustration";
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum_pages_blocks_hero_visual_illustration" USING "visual_illustration"::"public"."enum_pages_blocks_hero_visual_illustration";
  ALTER TABLE "pages_blocks_media" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_media" ALTER COLUMN "visual_illustration" SET DEFAULT 'dashboard'::text;
  DROP TYPE "public"."enum_pages_blocks_media_visual_illustration";
  CREATE TYPE "public"."enum_pages_blocks_media_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "pages_blocks_media" ALTER COLUMN "visual_illustration" SET DEFAULT 'dashboard'::"public"."enum_pages_blocks_media_visual_illustration";
  ALTER TABLE "pages_blocks_media" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum_pages_blocks_media_visual_illustration" USING "visual_illustration"::"public"."enum_pages_blocks_media_visual_illustration";
  ALTER TABLE "pages_blocks_split" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_split" ALTER COLUMN "visual_illustration" SET DEFAULT 'builder'::text;
  DROP TYPE "public"."enum_pages_blocks_split_visual_illustration";
  CREATE TYPE "public"."enum_pages_blocks_split_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "pages_blocks_split" ALTER COLUMN "visual_illustration" SET DEFAULT 'builder'::"public"."enum_pages_blocks_split_visual_illustration";
  ALTER TABLE "pages_blocks_split" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum_pages_blocks_split_visual_illustration" USING "visual_illustration"::"public"."enum_pages_blocks_split_visual_illustration";
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ALTER COLUMN "visual_illustration" SET DEFAULT 'dashboard'::text;
  DROP TYPE "public"."enum_pages_blocks_feature_tabs_tabs_visual_illustration";
  CREATE TYPE "public"."enum_pages_blocks_feature_tabs_tabs_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ALTER COLUMN "visual_illustration" SET DEFAULT 'dashboard'::"public"."enum_pages_blocks_feature_tabs_tabs_visual_illustration";
  ALTER TABLE "pages_blocks_feature_tabs_tabs" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum_pages_blocks_feature_tabs_tabs_visual_illustration" USING "visual_illustration"::"public"."enum_pages_blocks_feature_tabs_tabs_visual_illustration";
  ALTER TABLE "pages_blocks_feature_story" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_feature_story" ALTER COLUMN "visual_illustration" SET DEFAULT 'builder'::text;
  DROP TYPE "public"."enum_pages_blocks_feature_story_visual_illustration";
  CREATE TYPE "public"."enum_pages_blocks_feature_story_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "pages_blocks_feature_story" ALTER COLUMN "visual_illustration" SET DEFAULT 'builder'::"public"."enum_pages_blocks_feature_story_visual_illustration";
  ALTER TABLE "pages_blocks_feature_story" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum_pages_blocks_feature_story_visual_illustration" USING "visual_illustration"::"public"."enum_pages_blocks_feature_story_visual_illustration";
  ALTER TABLE "pages_blocks_integrations" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_integrations" ALTER COLUMN "visual_illustration" SET DEFAULT 'integrations'::text;
  DROP TYPE "public"."enum_pages_blocks_integrations_visual_illustration";
  CREATE TYPE "public"."enum_pages_blocks_integrations_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "pages_blocks_integrations" ALTER COLUMN "visual_illustration" SET DEFAULT 'integrations'::"public"."enum_pages_blocks_integrations_visual_illustration";
  ALTER TABLE "pages_blocks_integrations" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum_pages_blocks_integrations_visual_illustration" USING "visual_illustration"::"public"."enum_pages_blocks_integrations_visual_illustration";
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "visual_illustration" SET DEFAULT 'stage'::text;
  DROP TYPE "public"."enum__pages_v_blocks_hero_visual_illustration";
  CREATE TYPE "public"."enum__pages_v_blocks_hero_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "visual_illustration" SET DEFAULT 'stage'::"public"."enum__pages_v_blocks_hero_visual_illustration";
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum__pages_v_blocks_hero_visual_illustration" USING "visual_illustration"::"public"."enum__pages_v_blocks_hero_visual_illustration";
  ALTER TABLE "_pages_v_blocks_media" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_media" ALTER COLUMN "visual_illustration" SET DEFAULT 'dashboard'::text;
  DROP TYPE "public"."enum__pages_v_blocks_media_visual_illustration";
  CREATE TYPE "public"."enum__pages_v_blocks_media_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "_pages_v_blocks_media" ALTER COLUMN "visual_illustration" SET DEFAULT 'dashboard'::"public"."enum__pages_v_blocks_media_visual_illustration";
  ALTER TABLE "_pages_v_blocks_media" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum__pages_v_blocks_media_visual_illustration" USING "visual_illustration"::"public"."enum__pages_v_blocks_media_visual_illustration";
  ALTER TABLE "_pages_v_blocks_split" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_split" ALTER COLUMN "visual_illustration" SET DEFAULT 'builder'::text;
  DROP TYPE "public"."enum__pages_v_blocks_split_visual_illustration";
  CREATE TYPE "public"."enum__pages_v_blocks_split_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "_pages_v_blocks_split" ALTER COLUMN "visual_illustration" SET DEFAULT 'builder'::"public"."enum__pages_v_blocks_split_visual_illustration";
  ALTER TABLE "_pages_v_blocks_split" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum__pages_v_blocks_split_visual_illustration" USING "visual_illustration"::"public"."enum__pages_v_blocks_split_visual_illustration";
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ALTER COLUMN "visual_illustration" SET DEFAULT 'dashboard'::text;
  DROP TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_visual_illustration";
  CREATE TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ALTER COLUMN "visual_illustration" SET DEFAULT 'dashboard'::"public"."enum__pages_v_blocks_feature_tabs_tabs_visual_illustration";
  ALTER TABLE "_pages_v_blocks_feature_tabs_tabs" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum__pages_v_blocks_feature_tabs_tabs_visual_illustration" USING "visual_illustration"::"public"."enum__pages_v_blocks_feature_tabs_tabs_visual_illustration";
  ALTER TABLE "_pages_v_blocks_feature_story" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_feature_story" ALTER COLUMN "visual_illustration" SET DEFAULT 'builder'::text;
  DROP TYPE "public"."enum__pages_v_blocks_feature_story_visual_illustration";
  CREATE TYPE "public"."enum__pages_v_blocks_feature_story_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "_pages_v_blocks_feature_story" ALTER COLUMN "visual_illustration" SET DEFAULT 'builder'::"public"."enum__pages_v_blocks_feature_story_visual_illustration";
  ALTER TABLE "_pages_v_blocks_feature_story" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum__pages_v_blocks_feature_story_visual_illustration" USING "visual_illustration"::"public"."enum__pages_v_blocks_feature_story_visual_illustration";
  ALTER TABLE "_pages_v_blocks_integrations" ALTER COLUMN "visual_illustration" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_integrations" ALTER COLUMN "visual_illustration" SET DEFAULT 'integrations'::text;
  DROP TYPE "public"."enum__pages_v_blocks_integrations_visual_illustration";
  CREATE TYPE "public"."enum__pages_v_blocks_integrations_visual_illustration" AS ENUM('stage', 'dashboard', 'agent', 'comparison', 'sources', 'team', 'integrations', 'alerts', 'builder', 'flyingKpis', 'portfolio', 'campaigns', 'agentChat', 'resi', 'mcp', 'kpiStudio', 'templates', 'governance', 'sync', 'semanticLayer', 'dimensions', 'collections');
  ALTER TABLE "_pages_v_blocks_integrations" ALTER COLUMN "visual_illustration" SET DEFAULT 'integrations'::"public"."enum__pages_v_blocks_integrations_visual_illustration";
  ALTER TABLE "_pages_v_blocks_integrations" ALTER COLUMN "visual_illustration" SET DATA TYPE "public"."enum__pages_v_blocks_integrations_visual_illustration" USING "visual_illustration"::"public"."enum__pages_v_blocks_integrations_visual_illustration";`)
}
