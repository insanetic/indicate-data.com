/**
 * Stops before `payload migrate` when the database in DATABASE_URL was built by schema push.
 *
 *   node scripts/check-migration-baseline.mjs
 *
 * Such a database has a `batch = -1` marker row in payload_migrations. `payload migrate` then asks
 * whether to go ahead, and without a terminal (the dev container) it waits there forever. This
 * script exits 1 with instructions instead. A fresh database or one without the marker: exit 0.
 */
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'

// pg is a dependency of the Postgres adapter, not of the project, so resolve it from there.
const require = createRequire(import.meta.resolve('@payloadcms/db-postgres'))
const { Client } = require('pg')

if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env')
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('check-migration-baseline: DATABASE_URL is not set.')
  process.exit(1)
}

const client = new Client({ connectionString })
let markers = 0
try {
  await client.connect()
  const { rows } = await client.query("select to_regclass('payload_migrations') is not null as present")
  if (rows[0].present) {
    const result = await client.query('select count(*)::int as n from payload_migrations where batch = -1')
    markers = result.rows[0].n
  }
} catch (err) {
  // A database that does not exist yet has no marker; Payload creates it on connect.
  if (err.code === '3D000') process.exit(0)
  console.error(`check-migration-baseline: cannot read the database: ${err.message}`)
  process.exit(1)
} finally {
  await client.end().catch(() => {})
}

if (markers > 0) {
  const db = new URL(connectionString).pathname.slice(1)
  console.error(`
Database "${db}" was built by Payload's schema push (payload_migrations has a batch = -1 row).
'payload migrate' would stop and wait for a confirmation that nobody can give here.

Record the migrations this schema already has as applied, once. The SQL and the list of
migration names are in deploy/README.md, "Switching an existing dev database over (once)":

  docker compose exec -T postgres psql -U payload -d ${db} -v ON_ERROR_STOP=1 <<'SQL'
  ...the SQL from deploy/README.md...
  SQL

Then start the app again ('docker compose up app'); 'make migrate-status' lists what is recorded.
`)
  process.exit(1)
}
