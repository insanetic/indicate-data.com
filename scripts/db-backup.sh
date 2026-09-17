#!/usr/bin/env sh
# Dump the local Payload database and media uploads so other developers can
# restore the exact same content. Requires the Docker stack (or at least the
# postgres service) to be running: `docker compose up -d postgres`.
#
#   scripts/db-backup.sh            # writes backups/payload-<stamp>.dump + media-<stamp>.tar.gz
#
# Restore with scripts/db-restore.sh <stamp>.
set -eu

cd "$(dirname "$0")/.."
STAMP=$(date +%Y%m%d-%H%M)
CONTAINER=$(docker compose ps -q postgres)
[ -n "$CONTAINER" ] || { echo "postgres service is not running (docker compose up -d postgres)"; exit 1; }

mkdir -p backups
docker exec "$CONTAINER" pg_dump -U payload -d payload -Fc --no-owner --no-privileges -f /tmp/payload.dump
docker cp "$CONTAINER:/tmp/payload.dump" "backups/payload-$STAMP.dump"
docker exec "$CONTAINER" rm /tmp/payload.dump

if [ -d public/media ]; then
  tar -czf "backups/media-$STAMP.tar.gz" -C public media
fi

ls -la backups/*"$STAMP"*
echo "Done. Commit backups/ or share the files; restore with: scripts/db-restore.sh $STAMP"
