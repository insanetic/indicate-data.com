#!/usr/bin/env sh
# Runs on the server: dumps the database and the media volume into ./backups and drops
# backups older than KEEP_DAYS (default 14). Same file layout as scripts/db-backup.sh.
#
#   ./backup.sh
#   cron: 15 3 * * * /opt/indicate-site/backup.sh >> /opt/indicate-site/backups/backup.log 2>&1
set -eu
cd "$(dirname "$0")"
STAMP=$(date +%Y%m%d-%H%M)
mkdir -p backups

./stack exec -T postgres pg_dump -U payload -d payload -Fc --no-owner --no-privileges > "backups/payload-$STAMP.dump.part"
mv "backups/payload-$STAMP.dump.part" "backups/payload-$STAMP.dump"
./stack exec -T app tar -czf - -C /app media > "backups/media-$STAMP.tar.gz.part"
mv "backups/media-$STAMP.tar.gz.part" "backups/media-$STAMP.tar.gz"

find backups -name '*.dump' -mtime +"${KEEP_DAYS:-14}" -delete
find backups -name '*.tar.gz' -mtime +"${KEEP_DAYS:-14}" -delete
echo "$STAMP"
