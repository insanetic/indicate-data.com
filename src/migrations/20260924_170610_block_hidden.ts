import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_logo_wall" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_feature_tabs" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_feature_story" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_agent_showcase" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_steps" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_integrations" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_integration_directory" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_pillars" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_card_grid" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_stats" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_testimonials" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_pricing_teaser" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_pricing" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_cta_section" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_spotlight" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_document" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_content" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_media_block" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_form_block" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_archive" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_logo_wall" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_feature_tabs" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_feature_story" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_agent_showcase" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_steps" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_integrations" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_integration_directory" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_pillars" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_card_grid" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_stats" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_pricing_teaser" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_pricing" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_cta_section" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_spotlight" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_document" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_content" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_media_block" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_form_block" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_archive" ADD COLUMN "hidden" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "hidden" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_logo_wall" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_feature_tabs" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_feature_story" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_agent_showcase" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_steps" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_integrations" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_integration_directory" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_pillars" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_card_grid" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_stats" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_testimonials" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_pricing_teaser" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_pricing" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_faq" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_cta_section" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_spotlight" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_document" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_content" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_media_block" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_form_block" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_archive" DROP COLUMN "hidden";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_logo_wall" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_feature_tabs" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_feature_story" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_agent_showcase" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_steps" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_integrations" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_integration_directory" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_pillars" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_card_grid" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_stats" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_testimonials" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_pricing_teaser" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_pricing" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_cta_section" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_spotlight" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_document" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_content" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_media_block" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_form_block" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_archive" DROP COLUMN "hidden";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "hidden";`)
}
