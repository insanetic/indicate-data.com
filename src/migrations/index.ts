import * as migration_20260921_153447_initial from './20260921_153447_initial';

export const migrations = [
  {
    up: migration_20260921_153447_initial.up,
    down: migration_20260921_153447_initial.down,
    name: '20260921_153447_initial'
  },
];
