import * as migration_20260921_153447_initial from './20260921_153447_initial';
import * as migration_20260922_142530 from './20260922_142530';
import * as migration_20260922_161951_consent_integration_settings from './20260922_161951_consent_integration_settings';
import * as migration_20260923_113546_testimonials from './20260923_113546_testimonials';

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
    up: migration_20260923_113546_testimonials.up,
    down: migration_20260923_113546_testimonials.down,
    name: '20260923_113546_testimonials'
  },
];
