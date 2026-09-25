import * as migration_20260921_153447_initial from './20260921_153447_initial';
import * as migration_20260922_142530 from './20260922_142530';
import * as migration_20260922_161951_consent_integration_settings from './20260922_161951_consent_integration_settings';
import * as migration_20260923_131001_testimonials from './20260923_131001_testimonials';
import * as migration_20260924_170610_block_hidden from './20260924_170610_block_hidden';
import * as migration_20260924_222517_section_blocks from './20260924_222517_section_blocks';
import * as migration_20260925_092249_illustration_resi_hub from './20260925_092249_illustration_resi_hub';
import * as migration_20260925_154446_stat_width from './20260925_154446_stat_width';
import * as migration_20260925_155847_illustration_paper_plane from './20260925_155847_illustration_paper_plane';
import * as migration_20260925_162647_stat_word from './20260925_162647_stat_word';
import * as migration_20260925_163707_stat_unit from './20260925_163707_stat_unit';
import * as migration_20260925_163800_convert_sections from './20260925_163800_convert_sections';

export const migrations = [
  {
    up: migration_20260921_153447_initial.up,
    down: migration_20260921_153447_initial.down,
    name: '20260921_153447_initial',
  },
  {
    up: migration_20260922_142530.up,
    down: migration_20260922_142530.down,
    name: '20260922_142530',
  },
  {
    up: migration_20260922_161951_consent_integration_settings.up,
    down: migration_20260922_161951_consent_integration_settings.down,
    name: '20260922_161951_consent_integration_settings',
  },
  {
    up: migration_20260923_131001_testimonials.up,
    down: migration_20260923_131001_testimonials.down,
    name: '20260923_131001_testimonials',
  },
  {
    up: migration_20260924_170610_block_hidden.up,
    down: migration_20260924_170610_block_hidden.down,
    name: '20260924_170610_block_hidden',
  },
  {
    up: migration_20260924_222517_section_blocks.up,
    down: migration_20260924_222517_section_blocks.down,
    name: '20260924_222517_section_blocks',
  },
  {
    up: migration_20260925_092249_illustration_resi_hub.up,
    down: migration_20260925_092249_illustration_resi_hub.down,
    name: '20260925_092249_illustration_resi_hub',
  },
  {
    up: migration_20260925_154446_stat_width.up,
    down: migration_20260925_154446_stat_width.down,
    name: '20260925_154446_stat_width',
  },
  {
    up: migration_20260925_155847_illustration_paper_plane.up,
    down: migration_20260925_155847_illustration_paper_plane.down,
    name: '20260925_155847_illustration_paper_plane',
  },
  {
    up: migration_20260925_162647_stat_word.up,
    down: migration_20260925_162647_stat_word.down,
    name: '20260925_162647_stat_word',
  },
  {
    up: migration_20260925_163707_stat_unit.up,
    down: migration_20260925_163707_stat_unit.down,
    name: '20260925_163707_stat_unit',
  },
  {
    up: migration_20260925_163800_convert_sections.up,
    down: migration_20260925_163800_convert_sections.down,
    name: '20260925_163800_convert_sections',
  },
];
