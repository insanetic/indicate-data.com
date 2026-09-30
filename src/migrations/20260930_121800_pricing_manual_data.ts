import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { startManualPricing } from '../pricing/startManual'

/**
 * Copies the example plans into the pricing global's manual fields and switches the source from
 * "Example data" to "Maintained by hand"; the page looks the same and becomes editable. Leaves
 * plans already typed in alone and never switches off the live Subneo API. Reads and writes
 * through the current config, like 20260925_163800_convert_sections: a later migration that adds
 * a column to the pricing global has to sort before this one until production has run it.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const result = await startManualPricing(payload, req)
  payload.logger.info(
    result.copied ? `[pricing] example plans copied, source is now "${result.source}"` : '[pricing] manual plans exist already, nothing changed',
  )
}

// Data only. The schema migration's down drops the manual tables and resets the source.
export async function down(_args: MigrateDownArgs): Promise<void> {}
