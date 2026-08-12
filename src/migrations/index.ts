import * as migration_20240831_094937_initial from './20240831_094937_initial';
import * as migration_20241014_085848_update_v3_0_0_beta_113 from './20241014_085848_update_v3_0_0_beta_113';
import * as migration_20241120_133552_payload_v3_production from './20241120_133552_payload_v3_production';
import * as migration_20241122_141949_update_v3_0_2_production from './20241122_141949_update_v3_0_2_production';
import * as migration_20260728_040622 from './20260728_040622';
import * as migration_20260728_054527 from './20260728_054527';
import * as migration_20260729_102112 from './20260729_102112';
import * as migration_20260812_045633 from './20260812_045633';
import * as migration_20260812_100000 from './20260812_100000';

export const migrations = [
  {
    up: migration_20240831_094937_initial.up,
    down: migration_20240831_094937_initial.down,
    name: '20240831_094937_initial',
  },
  {
    up: migration_20241014_085848_update_v3_0_0_beta_113.up,
    down: migration_20241014_085848_update_v3_0_0_beta_113.down,
    name: '20241014_085848_update_v3_0_0_beta_113',
  },
  {
    up: migration_20241120_133552_payload_v3_production.up,
    down: migration_20241120_133552_payload_v3_production.down,
    name: '20241120_133552_payload_v3_production',
  },
  {
    up: migration_20241122_141949_update_v3_0_2_production.up,
    down: migration_20241122_141949_update_v3_0_2_production.down,
    name: '20241122_141949_update_v3_0_2_production',
  },
  {
    up: migration_20260728_040622.up,
    down: migration_20260728_040622.down,
    name: '20260728_040622',
  },
  {
    up: migration_20260728_054527.up,
    down: migration_20260728_054527.down,
    name: '20260728_054527',
  },
  {
    up: migration_20260729_102112.up,
    down: migration_20260729_102112.down,
    name: '20260729_102112',
  },
  {
    up: migration_20260812_045633.up,
    down: migration_20260812_045633.down,
    name: '20260812_045633'
  },
  {
    up: migration_20260812_100000.up,
    down: migration_20260812_100000.down,
    name: '20260812_100000',
  },
];
