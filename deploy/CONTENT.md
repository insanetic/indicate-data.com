# Moving content between a local database and production

The image carries no content. Pages, posts, globals and the uploaded files are the
database and the media volume, and both live outside the container: the database is
`indicate_website` in the production PostgreSQL cluster, the uploads are the `media`
volume on the website host. This page is how content gets from one to the other.

Rollout of the image itself is not here - that is `make website ENV=production APPLY=1`
in the `indicate-infra` repository (`docs/WEBSITE.md`). What this page adds is the part
no playbook does, on purpose: replacing content is a judgement call, not a step.

## Reaching the host

The website host sits behind the bastion and has no DNS name, so give it an entry once:

```
# ~/.ssh/config
Host bastion-prod
  HostName 46.224.184.86
  User deploy
  IdentityFile ~/.ssh/prod_deploy_ed25519

Host envoy-discovery-01
  HostName 10.80.10.8
  User deploy
  IdentityFile ~/.ssh/prod_deploy_ed25519
  ProxyJump bastion-prod
```

Every command below is then `ssh envoy-discovery-01 '...'`, with the dump streamed over
the same connection - nothing is left lying on the web host.

## The helper container

There is no PostgreSQL on the website host and no `psql` either: the database is in the
cluster and the app talks to it with a client certificate. So each step below runs a
throwaway `postgres:18` container that mounts the certificate directory and exits. Set
these three shell variables first and the commands stay short:

```bash
PG=mirror.gcr.io/library/postgres:18
DB='-h 10.80.30.8 -p 6432 -U indicate_website -d indicate_website'
TLS='-v /etc/pki/indicate-website/postgres:/tls:ro -e PGSSLMODE=verify-ca -e PGSSLROOTCERT=/tls/server-ca.pem -e PGSSLCERT=/tls/client.cert.pem -e PGSSLKEY=/tls/client.key.pem'
```

They are used unquoted inside double-quoted remote commands, so the word splitting is
deliberate. Everything below assumes the three are set in the shell you are in.

**Why a mirror and not `postgres:18`.** The host is logged in to Docker Hub with the
read-only organisation access token that pulls the private website image, and Docker Hub
refuses that token for every other repository - including public ones. The pull fails with
`authentication required - access token has insufficient scopes`. Any registry that needs
no Docker Hub credential works instead:

| Registry | Reference | Notes |
| --- | --- | --- |
| Google | `mirror.gcr.io/library/postgres:18` | pull-through cache of Docker Hub, anonymous, any official tag |
| AWS | `public.ecr.aws/docker/library/postgres:18` | mirror of the official images; carries `postgres` and `busybox`, **not** `alpine` |
| Docker Hub, anonymously | `postgres:18` after `sudo docker logout` on the host | works, but the next private image pull fails until `make website` logs back in. Last resort. |

`ghcr.io` is not an option here: it hosts projects that publish there, and the official
`postgres` and `alpine` images are not among them.

The same `postgres:18` image is used for the media steps too (it is Debian, so it has
`tar`, `find` and `chown`), which keeps it at one pull.

## Always: a dump before you touch anything

The website host no longer keeps nightly dumps - `roles/website/defaults/main.yml` in the
infra repository is explicit that the role installs no backup timer and removes one it
finds, because the content is in the cluster and the cluster has pgBackRest. But pgBackRest
restores a whole cluster to a point in time; it cannot put back one page somebody deleted.
That gap is yours to cover, and it costs one command:

```bash
STAMP=$(date +%Y%m%d-%H%M%S)

ssh envoy-discovery-01 "sudo docker run --rm $TLS $PG \
  pg_dump $DB -Fc --no-owner --no-privileges" > backups/prod-$STAMP.dump

ssh envoy-discovery-01 "sudo docker run --rm -v indicate-website_media:/media \
  --entrypoint tar $PG -czf - -C / media" > backups/prod-media-$STAMP.tar.gz
```

Take one before every image rollout and before every restore. `pg_restore --list
backups/prod-<stamp>.dump` reads it back without touching a database.

## Loading a local database into production

For the first fill, or any deliberate overwrite. **It replaces all production content.**

The schema in the dump must match the image that will run against it. Development uses
schema push, production only migrations, so:

1. Commit the migration for whatever you changed (`make migration NAME=...`), `make ship`,
   and roll that tag out. `ssh envoy-discovery-01 'docker ps --format "{{.Image}}"'` shows
   what is live.
2. Note the migration file names in `src/migrations/` at that commit, without `.ts`. They
   go into step 4 below - at the time of writing, `20260921_153447_initial` and
   `20260922_142530`.

```bash
# 0. a fresh local dump, and the safety dump above
scripts/db-backup.sh
STAMP=20260922-1622        # the stamp it printed

# 1. stop the site. The unit's ExecStop is `docker compose down`, so the container is
#    removed - which is also how the stale rendered pages go away. The media volume stays.
ssh envoy-discovery-01 'sudo systemctl stop website'

# 2. the database
ssh envoy-discovery-01 "sudo docker run --rm -i $TLS $PG \
  pg_restore --clean --if-exists --no-owner --no-privileges $DB" \
  < backups/payload-$STAMP.dump

# 3. the media volume
ssh envoy-discovery-01 "sudo docker run --rm -i -v indicate-website_media:/media \
  --entrypoint sh $PG -c 'find /media -mindepth 1 -delete; \
  tar -xzf - -C /media --strip-components=1; find /media -name \"._*\" -delete; \
  chown -R 1001:1001 /media'" \
  < backups/media-$STAMP.tar.gz

# 4. the migration ledger - see below for why
ssh envoy-discovery-01 "sudo docker run --rm -i $TLS $PG \
  psql $DB -v ON_ERROR_STOP=1 -f -" <<'SQL'
delete from payload_migrations where batch = -1;
insert into payload_migrations (name, batch, created_at, updated_at)
select v.name, 1, now(), now()
from (values ('20260921_153447_initial'), ('20260922_142530')) v(name)
where not exists (select 1 from payload_migrations m where m.name = v.name);
SQL

# 5. a new container, and wait for it
ssh envoy-discovery-01 'sudo systemctl start website'
ssh envoy-discovery-01 'curl -s localhost:3000/next/health'
```

**Step 4 is not optional and it is the only fiddly part.** A database whose schema was
pushed by `pnpm dev` carries a row in `payload_migrations` with `batch = -1`. The migration
runner sees it, decides the schema was never migrated, and stops - without a terminal it
cannot ask, so the container exits and the site never comes up. Deleting the marker is half
of it; the other half is telling the ledger which migrations the image should consider done.
Name exactly the migrations that image contains. Name too few and it re-applies one against
a schema that already has it; name one the image does not have and nothing happens, the row
is ignored.

Two consequences of a local dump worth knowing, neither of them a problem:

- **Logins from the dump keep working.** Passwords are pbkdf2 with a per-user salt, so
  production's different `PAYLOAD_SECRET` does not touch them. Only browser sessions are
  invalidated - log in again.
- **Values Payload encrypts with the secret do not survive**, because the secret differs.
  In this project that is exactly the MCP plugin's API keys; re-enter them in the admin.
  The Subneo key is a plain text field and comes across fine.

## Pulling production content to your laptop

After launch this is the direction that matters: production is the real content, local is a
scratch copy. It is also how you rehearse a migration against real data.

```bash
# take a dump as above, then
dropdb --if-exists payload_local && createdb payload_local
pg_restore --no-owner --no-privileges -d payload_local backups/prod-<stamp>.dump
```

A production dump carries production's `payload_migrations` rows, so `payload migrate`
against it does exactly what it will do on the cluster. That is the rehearsal: green here
and the deploy is dull. Add the media tarball only if you need the files; it is a full copy
of every upload.

## Rolling a new image over live content

What the roll itself cannot touch: the database is in the cluster and the media volume is
named and outside the container, so `docker compose up -d` with a new tag recreates the app
and leaves both alone. The rendered-page cache does go, because it lives in the container
filesystem, and that is wanted. Configuration is in `config/app.env`, not in the image.

So the only thing that can damage content is a migration, and there are four ways:

- **Migrations run before the first request.** Every migration file in the new image that
  the ledger does not list is applied to live data. `make migration` generates a rename as
  drop + add, which loses the column's contents - read the generated SQL, and split a rename
  over two releases (add and backfill, drop later).
- **Production's schema came from a development push, not from running those files.** Step 4
  above recorded them as applied; it did not verify them. A future migration is generated by
  diffing the config against the snapshot in `src/migrations/*.json`, so if the pushed schema
  ever disagreed with what those files produce, the difference surfaces on production and
  nowhere else. Rehearse against a production dump, as above, until production content has
  been through at least one real migration.
- **A failing migration takes the site down, not the data.** The container exits and the
  playbook's health wait fails. Content is intact; fix forward and ship again.
- **Rolling the tag back does not roll the schema back.** The previous image meets a
  migrated database. Keep migrations backwards compatible or restore the dump.

One thing that is not a migration but has the same blast radius: **never change
`PAYLOAD_SECRET`** on a populated database. Sessions are only inconvenienced, but everything
Payload encrypted with it - the MCP API keys - becomes unreadable.

And never `docker compose down -v` on the website host: `-v` deletes the `media` volume,
which is the one piece of content with no copy in the cluster.

## When it goes wrong

| Symptom | Cause |
| --- | --- |
| `access token has insufficient scopes` on a pull | the host's Docker Hub login; use a mirror from the table above |
| `private key file has group or world access` | the certificate directory was mounted from somewhere else; it is `root:website 0640` at `/etc/pki/indicate-website/postgres`, which libpq accepts only for a root-owned file, so run the container as root (no `--user`) |
| Container exits at start, log mentions migrations | the ledger; see step 4 |
| `ERR_TLS_CERT_ALTNAME_INVALID` | `sslmode=verify-full` against `10.80.30.8`, which is not in the cluster leaf's SANs. The app uses `verify-ca`; so should you |
| Old pages after a restore | the container was restarted rather than recreated. `systemctl stop website && systemctl start website` |
