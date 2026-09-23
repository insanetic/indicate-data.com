# Production image

`make ship` builds the production image on your machine and pushes it to Docker Hub.
Rolling it out on the server is done with Ansible and lives outside this repo. This page
describes the build and everything the Ansible side needs to know about the image.

```
make ship        # build + push the current commit
make help        # all targets
```

## Shipping

1. Once: create a private Docker Hub repository, run `docker login`, and fill in
   `deploy/config.mk` (`IMAGE`, and `PLATFORM` for an ARM server).
2. `make ship`. It pushes `IMAGE:<tag>` and `IMAGE:latest` and prints the tag.

Tags are the short commit hash. A tag ending in `-dirty` was built from uncommitted changes;
commit first for anything that should be reproducible. Deploy the hash tag rather than `latest`,
so a rollback is just the previous tag.

The build needs no database. It compiles on your machine's own CPU and only fetches the sharp
binaries for `PLATFORM`, so an Apple Silicon Mac can build `linux/amd64` (Turbopack crashes under
emulation, which is why the Dockerfile is split that way).

Nothing site-specific is compiled in: the same image serves staging and production, and all
configuration is read when the container starts (next section).

## Configuration

The container assembles its configuration at start, highest precedence first:

1. variables set on the container (`docker run -e`, compose `environment:` or `env_file:`)
2. files mounted into `/app/config/*.env` (a bind mount or volume from the host)
3. `/app/defaults.env` baked into the image (source: `deploy/defaults.env`)

Files are plain `KEY=VALUE` lines, `#` comments allowed, no shell syntax. A key is only taken
from a file when it is not already set, so an empty `-e SITE_URL=` on the container deliberately
wins over the file. The whole thing is `deploy/docker-entrypoint.sh`. Template for the mounted
file: `deploy/app.env.example`.

Values are read per request on the server (site URL, Tag Manager id) and handed to the browser
with the page, so changing the file and recreating the container is enough; no rebuild.

## An external PostgreSQL with mTLS

Production points the app at the shared PostgreSQL cluster rather than the one in
this stack, and authenticates with a client certificate instead of a password.
This needs no code and no rebuild: it is one connection string plus the three
files it names.

```
DATABASE_URL=postgres://indicate_website@10.80.30.8:6432/indicate_website?sslmode=verify-full&sslrootcert=/app/tls/postgres/server-ca.pem&sslcert=/app/tls/postgres/client.cert.pem&sslkey=/app/tls/postgres/client.key.pem
```

The driver reads those three paths itself when the pool is built, so the whole
of it is configuration. Four things decide whether it works:

- **`sslmode=verify-full`** checks the server's certificate *and* that its name
  matches the host in the URL. Connecting to an IP therefore needs that IP in the
  server certificate's subject alternative names; a mismatch fails with
  `Hostname/IP does not match certificate's altnames`. This is the mode to use -
  `require` encrypts but authenticates nothing.
- **No password.** With `clientcert=verify-full` and `cert` authentication, the
  certificate is the credential, so the URL carries a user and no password.
- **The certificate's common name must equal the database user.** The cluster
  matches the CN against the role being requested, so a certificate issued for
  the wrong name fails with `certificate authentication failed for user ...`.
  Issuing the wrong certificate cannot accidentally grant access.
- **The container must be able to read the key.** It runs as uid 1001. A key
  written on the host as `root:<service group>` mode 0640 is unreadable to it
  until that group is added to the container:

  ```yaml
  services:
    app:
      volumes:
        - /etc/pki/indicate-website/postgres:/app/tls/postgres:ro
      group_add:
        - '3100'     # the gid that owns the key on the host
  ```

  Without it the app logs `cannot connect to Postgres. Details: EACCES:
  permission denied, open '/app/tls/postgres/client.key.pem'` and never becomes
  healthy. Mount the directory read-only; the app only ever reads it.

Verified against a PostgreSQL 18 whose `pg_hba.conf` has no plaintext line at
all and requires `cert clientcert=verify-full`: a plaintext connection and a TLS
connection without a client certificate are both refused, the app connects,
applies its migrations and serves, and the server reports the session as TLS 1.3
with client DN `/CN=indicate_website`.

## Image contract

| | |
| --- | --- |
| Port | `3000`, plain HTTP. Put a TLS reverse proxy in front. |
| Health | `GET /next/health` answers 200 once Payload is initialised and Postgres replies. The image has a `HEALTHCHECK` on it. |
| Volume | `/app/media` holds all uploads. Must be persistent; owned by uid `1001`. |
| User | runs as `nextjs` (uid 1001), not root |
| Revision | `GIT_REVISION` env var and the `org.opencontainers.image.revision` label carry the tag |

Runtime environment:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `postgres://user:password@host:5432/db`. Keep the password URL-safe (hex). PostgreSQL 18. For an external cluster with client certificates, see the section above. |
| `PAYLOAD_SECRET` | yes | Signs sessions and encrypts stored keys. Never change it on a database with content. |
| `SITE_URL` | yes | Public origin, e.g. `https://indicate-data.com`. Default in the image: `http://localhost:3000`. |
| `PREVIEW_SECRET` | yes | Live preview links from the admin. |
| `CRON_SECRET` | yes | Bearer token for Payload's jobs endpoint. |
| `GTM_ID` | no | Fallback Tag Manager container id. Normally set in the admin under Cookies & tracking → Integrations, which wins over this. Neither: no tracker and no consent banner. |
| `SUBNEO_API_KEY` | no | Can also be stored in the admin. |

Image defaults you normally leave alone: `MEDIA_DIR=/app/media`, `PAYLOAD_MIGRATE_ON_START=true`,
`NODE_ENV=production`, `PORT`, `HOSTNAME`.

Behaviour worth knowing when writing the playbook:

- **Migrations run on start.** Pending files from `src/migrations/` are applied before the first
  request. A failing migration makes the container exit, so wait for the healthcheck and fail the
  play if it does not turn healthy. Run a single app container; two starting at once would race.
- **Pages render on first request.** Nothing is prerendered at build time. Each page is rendered
  on its first visit and cached inside the container until Payload revalidates it. After replacing
  the database content, recreate the container (a restart keeps the stale page cache).
- **Rolling back an image does not undo a migration.** Keep migrations backwards compatible
  (add first, remove in a later release) or restore a backup.

## Reference stack

These files were tested together locally and can be copied or templated by Ansible:

| File | Purpose |
| --- | --- |
| `docker-compose.prod.yml` | Caddy (automatic HTTPS), app, PostgreSQL 18, named volumes; bind-mounts `./config` into the app |
| `deploy/Caddyfile` | Reverse proxy, security headers, 100 MB upload limit, `www` redirect |
| `deploy/production.env.example` | Template for the server's `.env`: what compose itself needs (domain, ACME mail, database password) |
| `deploy/app.env.example` | Template for `config/app.env`: the application's settings and secrets |
| `deploy/stack` | Wrapper: `docker compose` with `.env` + `release.env` (`IMAGE`, `TAG`) |
| `deploy/backup.sh` | Dumps database + media volume into `backups/`, 14 days retention, cron line inside |
| `deploy/restore.sh` | Replaces database + media from a backup, then recreates the app container |
| `deploy/CONTENT.md` | Content between a local database and the real production: dumps, restores, what a rollout can damage |

A release on the server boils down to: write `IMAGE` and `TAG` to `release.env`,
`./stack pull app`, `./stack up -d --remove-orphans`, wait until the app container is healthy.
A configuration change needs no pull: edit `config/app.env`, then `./stack up -d --force-recreate app`
(compose does not notice content changes inside a bind-mounted file).

**First content.** Either create the first admin at `/admin`, or restore a local dump made with
`scripts/db-backup.sh`. A dump from a development database that still used schema push (before
development switched to migrations) carries a marker row that makes the migration runner refuse
to start; `deploy/restore.sh` removes it and records the migration names you pass as applied, so
the dump must come from the same commit as the image. A dump from a migrated dev database needs no
names: its `payload_migrations` table already lists what ran.

```
./restore.sh 20260916-1322 20260921_153447_initial
```

That is the reference stack, whose PostgreSQL is a container in the same compose project. The
real production does not look like this: its database is in the shared cluster and there is no
restore script on the host. Moving content there, taking a dump from it, and what a new image
can and cannot damage are in [CONTENT.md](CONTENT.md).

## Schema changes

The schema only changes through the files in `src/migrations/`, in development as well as in
production. Payload's schema push is off (`push: false` in `src/payload.config.ts`), so `pnpm dev`
never alters a table. A field that exists in the config but not in the database shows up as a
server error ("column ... does not exist") and an empty admin view until its migration has run.

1. Change collections, globals or fields.
2. `make migration NAME=add_something` writes `src/migrations/<stamp>_add_something.ts` and a
   `.json` snapshot. It diffs the config against the newest snapshot in `src/migrations/` and
   does not read the database. With nothing to diff it writes nothing and says so.
3. Read the generated SQL. Renames show up as drop + add, which loses data: rewrite those by hand.
4. `make migrate` applies it to the dev database in the running container. `make migrate-status`
   lists what has run.
5. Commit the migration with the change, then `make ship`. Production applies it on start.

The dev container also runs `pnpm payload migrate` every time it starts, before `pnpm dev`. A
failing migration stops the container; `docker compose logs app` shows which one. Without the
container, run `pnpm payload migrate` on the host before `pnpm dev`. Host scripts
(`payload run scripts/...`, `generate:types`) no longer need `NODE_ENV=production`.

To undo the last batch while working on a migration: `docker compose exec -T app pnpm payload
migrate:down`. Delete or fix the file afterwards; `make migration` diffs against the newest
snapshot, so a stale one produces wrong SQL.

### Switching an existing dev database over (once)

A database that was built by schema push has a marker row in `payload_migrations` with
`batch = -1` and no record of the migration files. `payload migrate` then asks "It looks like
you've run Payload in dev mode ... Would you like to proceed?" and, without a terminal, waits
forever. So the dev container and `make migrate` first run `scripts/check-migration-baseline.mjs`,
which exits 1 on the marker and points here. The app container stops with that message in
`docker compose logs app`. Record the migrations as applied, with the stack's Postgres running:

```
docker compose exec -T postgres psql -U payload -d payload -v ON_ERROR_STOP=1 <<'SQL'
begin;
delete from payload_migrations where batch = -1;
insert into payload_migrations (name, batch, created_at, updated_at)
select v.name, 1, now(), now()
from (values
  ('20260921_153447_initial'),
  ('20260922_142530'),
  ('20260922_161951_consent_integration_settings'),
  ('20260923_131001_testimonials')
) v(name)
where not exists (select 1 from payload_migrations m where m.name = v.name);
commit;
SQL
```

This is the same SQL `restore.sh` runs. List exactly the migrations whose schema the database
already has: the four above for a database that was pushed at or after
`20260923_131001_testimonials`. Check with `make migrate-status`; every row should say `Yes`.
The same applies to a dump in `backups/` taken before the switch: restore it, then run the SQL
with the migration names from the commit the dump was taken at.

### Starting a dev database from scratch

```
docker compose exec -T app pnpm payload migrate:fresh --force-accept-warning
docker compose exec -T app pnpm payload run scripts/seed.ts
```

`migrate:fresh` drops every table and runs all migrations from the first one. It deletes all
content, including users; create the first admin at `/admin` afterwards. The seed installs the
site pages. Then restart the app container (`docker compose restart app`) so the Next.js cache
drops pages rendered from the old content.

## Not covered

- **Email.** No email adapter is configured, so password resets and form notifications are only
  written to the app log.
- **Monitoring.** Point an external uptime check at `https://<domain>/next/health`.
- **Scheduled jobs.** The jobs endpoint is protected by `CRON_SECRET`, but nothing calls it yet.
