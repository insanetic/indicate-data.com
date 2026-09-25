import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_items_items_width" AS ENUM('auto', 'fifth', 'quarter', 'third', 'half', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_items_items_width" AS ENUM('auto', 'fifth', 'quarter', 'third', 'half', 'full');
  ALTER TABLE "pages_blocks_items_items" ADD COLUMN "width" "enum_pages_blocks_items_items_width" DEFAULT 'auto';
  ALTER TABLE "_pages_v_blocks_items_items" ADD COLUMN "width" "enum__pages_v_blocks_items_items_width" DEFAULT 'auto';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_items_items" DROP COLUMN "width";
  ALTER TABLE "_pages_v_blocks_items_items" DROP COLUMN "width";
  DROP TYPE "public"."enum_pages_blocks_items_items_width";
  DROP TYPE "public"."enum__pages_v_blocks_items_items_width";`)
}
