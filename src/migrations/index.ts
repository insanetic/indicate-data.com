import * as migration_20260921_153447_initial from './20260921_153447_initial';
import * as migration_20260922_142530 from './20260922_142530';
import * as migration_20260922_161951_consent_integration_settings from './20260922_161951_consent_integration_settings';
import * as migration_20260923_131001_testimonials from './20260923_131001_testimonials';
import * as migration_20260924_170610_block_hidden from './20260924_170610_block_hidden';
import * as migration_20260924_212356_section_blocks from './20260924_212356_section_blocks';

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
    up: migration_20260924_212356_section_blocks.up,
    down: migration_20260924_212356_section_blocks.down,
    name: '20260924_212356_section_blocks'
  },
];
