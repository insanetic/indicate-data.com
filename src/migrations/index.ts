import * as migration_20260921_153447_initial from './20260921_153447_initial';
import * as migration_20260922_142530 from './20260922_142530';

export const migrations = [
  {
    up: migration_20260921_153447_initial.up,
    down: migration_20260921_153447_initial.down,
    name: '20260921_153447_initial',
  },
  {
    up: migration_20260922_142530.up,
    down: migration_20260922_142530.down,
    name: '20260922_142530'
  },
];
