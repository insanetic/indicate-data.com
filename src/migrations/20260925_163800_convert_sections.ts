import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { convertSectionBlocks } from '../sections/convertPages'

/**
 * Converts the legacy structural blocks and old widget spacing into section blocks (idempotent,
 * published and draft states per locale, inside this migration's transaction). Moved out of
 * 20260924_222517_section_blocks: the converter reads and writes pages through the current config,
 * so it has to run after every migration that adds a column to those blocks. Keep it the last
 * migration until production has run it; a later schema migration goes before it (rename the
 * stamp) or the conversion fails on a missing column. A database without pages skips it.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const pages = await db.execute(sql`SELECT 1 FROM "pages" LIMIT 1`)
  if (pages.rows.length === 0) {
    payload.logger.info('[sections] no pages to convert')
    return
  }
  const result = await convertSectionBlocks({ payload, req })
  payload.logger.info(`[sections] converted ${result.publishedPages} published pages and ${result.draftPages} drafts`)
}

// Data only. Roll back a conversion from the pre-deploy backup, as with 20260924_222517_section_blocks.
export async function down(_args: MigrateDownArgs): Promise<void> {}
