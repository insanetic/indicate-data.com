#!/usr/bin/env sh
# Restore a backup made by scripts/db-backup.sh into the local Docker Postgres
# and unpack the media uploads. REPLACES all current content in the database.
#
#   scripts/db-restore.sh              # restores the newest backup in backups/
#   scripts/db-restore.sh 20260916-1319
#
# Start only the database first (`docker compose up -d postgres`); the app
# container should be stopped or restarted afterwards so its caches are dropped.
set -eu

cd "$(dirname "$0")/.."
if [ "${1:-}" ]; then
  STAMP=$1
else
  STAMP=$(ls backups/payload-*.dump | sed -E 's#.*/payload-(.*)\.dump#\1#' | sort | tail -n1)
fi
DUMP="backups/payload-$STAMP.dump"
MEDIA="backups/media-$STAMP.tar.gz"
[ -f "$DUMP" ] || { echo "no such dump: $DUMP"; exit 1; }

docker compose up -d postgres
CONTAINER=$(docker compose ps -q postgres)
until docker exec "$CONTAINER" pg_isready -U payload -d payload >/dev/null 2>&1; do sleep 1; done

echo "Restoring $DUMP into the payload database (existing content is replaced)"
docker exec "$CONTAINER" psql -U payload -d postgres -v ON_ERROR_STOP=1 -q -c \
  "select pg_terminate_backend(pid) from pg_stat_activity where datname='payload' and pid<>pg_backend_pid();" \
  -c "drop database if exists payload;" -c "create database payload owner payload;"
docker cp "$DUMP" "$CONTAINER:/tmp/restore.dump"
docker exec "$CONTAINER" pg_restore -U payload -d payload --no-owner --no-privileges /tmp/restore.dump
docker exec "$CONTAINER" rm /tmp/restore.dump

if [ -f "$MEDIA" ]; then
  mkdir -p public
  tar -xzf "$MEDIA" -C public
  echo "Media uploads restored to public/media"
fi

# A dump from before development switched to migrations still carries the schema push marker.
# The app container's `payload migrate` would wait for an answer on it forever, so stop here.
if [ "$(docker exec "$CONTAINER" psql -U payload -d payload -tA -c "select count(*) from payload_migrations where batch = -1")" != "0" ]; then
  echo "This dump comes from a dev database that still used schema push (marker row batch = -1)."
  echo "Record its migrations as applied before starting the app: deploy/README.md, 'Switching an"
  echo "existing dev database over'. Use the migration names from the commit the dump was taken at."
  exit 1
fi

# Drop the app container's persisted Next.js data cache so it renders the restored content.
APP=$(docker compose ps -q app 2>/dev/null || true)
if [ -n "$APP" ]; then
  docker exec "$APP" rm -rf /app/.next/dev/cache/fetch-cache 2>/dev/null || true
  docker compose restart app
fi

echo "Done. Log in at http://localhost:3000/admin with an account from the backup."
