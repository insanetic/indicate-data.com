import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_items_items_locales" ADD COLUMN "word" varchar;
  ALTER TABLE "_pages_v_blocks_items_items_locales" ADD COLUMN "word" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_items_items_locales" DROP COLUMN "word";
  ALTER TABLE "_pages_v_blocks_items_items_locales" DROP COLUMN "word";`)
}
