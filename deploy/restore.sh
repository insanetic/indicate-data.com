#!/usr/bin/env sh
# Runs on the server. REPLACES the database and the media volume.
#
#   ./restore.sh <stamp> [migration-name ...]
#
# Expects backups/payload-<stamp>.dump and optionally backups/media-<stamp>.tar.gz.
# A dump taken from a development database that still used schema push carries a marker row
# that makes the migration runner stop. In that case the marker is removed and the given
# migration names (file names in src/migrations/ without .ts, e.g. 20260921_153447_initial) are
# recorded as applied; the dump must come from the same commit as the image.
set -eu
cd "$(dirname "$0")"
STAMP=$1
shift
DUMP="backups/payload-$STAMP.dump"
MEDIA="backups/media-$STAMP.tar.gz"
[ -f "$DUMP" ] || { echo "no such dump: $(pwd)/$DUMP"; exit 1; }

./stack up -d postgres
./stack stop app

psql_admin() { ./stack exec -T postgres psql -U payload -d postgres -v ON_ERROR_STOP=1 -q "$@"; }
psql_db() { ./stack exec -T postgres psql -U payload -d payload -v ON_ERROR_STOP=1 -qtA "$@"; }

echo "Restoring $DUMP (existing content is replaced)"
psql_admin -c "select pg_terminate_backend(pid) from pg_stat_activity where datname='payload' and pid<>pg_backend_pid();" \
  -c "drop database if exists payload;" -c "create database payload owner payload;"
./stack exec -T postgres pg_restore -U payload -d payload --no-owner --no-privileges < "$DUMP"

if [ "$(psql_db -c "select count(*) from payload_migrations where batch = -1")" != "0" ]; then
  echo "Dump comes from a development database: recording migrations as applied: $*"
  psql_db -c "delete from payload_migrations where batch = -1"
  for name in "$@"; do
    case "$name" in *[!A-Za-z0-9_]*) echo "unexpected migration name: $name"; exit 1 ;; esac
    psql_db -c "insert into payload_migrations (name, batch, updated_at, created_at)
      select '$name', 1, now(), now()
      where not exists (select 1 from payload_migrations where name = '$name')"
  done
fi

if [ -f "$MEDIA" ]; then
  echo "Restoring $MEDIA into the media volume"
  ./stack run --rm --no-deps -T --user root --entrypoint sh app -c \
    'find /app/media -mindepth 1 -delete && tar -xzf - -C /app/media --strip-components=1 && find /app/media -name "._*" -delete && chown -R nextjs:nodejs /app/media' < "$MEDIA"
fi

# A new container, not a restart: the old one still holds pages rendered from the old content.
./stack up -d --force-recreate app
echo "Restored $STAMP. Pending migrations, if any, run while the app starts."
