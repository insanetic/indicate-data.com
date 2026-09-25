import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_items_items_locales" ADD COLUMN "unit" varchar;
  ALTER TABLE "_pages_v_blocks_items_items_locales" ADD COLUMN "unit" varchar;`)

  // The shared `suffix` becomes the translatable `unit`: every locale starts with the old value.
  await db.execute(sql`
  UPDATE "pages_blocks_items_items_locales" l SET "unit" = i."suffix"
    FROM "pages_blocks_items_items" i WHERE l."_parent_id" = i."id" AND i."suffix" IS NOT NULL;
  UPDATE "pages_blocks_items_items" SET "suffix" = NULL WHERE "suffix" IS NOT NULL;
  UPDATE "_pages_v_blocks_items_items_locales" l SET "unit" = i."suffix"
    FROM "_pages_v_blocks_items_items" i WHERE l."_parent_id" = i."id" AND i."suffix" IS NOT NULL;
  UPDATE "_pages_v_blocks_items_items" SET "suffix" = NULL WHERE "suffix" IS NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Back to one shared value: the German unit wins.
  await db.execute(sql`
  UPDATE "pages_blocks_items_items" i SET "suffix" = l."unit"
    FROM "pages_blocks_items_items_locales" l WHERE l."_parent_id" = i."id" AND l."_locale" = 'de' AND l."unit" IS NOT NULL;
  UPDATE "_pages_v_blocks_items_items" i SET "suffix" = l."unit"
    FROM "_pages_v_blocks_items_items_locales" l WHERE l."_parent_id" = i."id" AND l."_locale" = 'de' AND l."unit" IS NOT NULL;`)
  await db.execute(sql`
   ALTER TABLE "pages_blocks_items_items_locales" DROP COLUMN "unit";
  ALTER TABLE "_pages_v_blocks_items_items_locales" DROP COLUMN "unit";`)
}
