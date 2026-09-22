#!/bin/sh
# Entrypoint of the production image. Assembles the runtime configuration, then starts the server.
#
# Precedence, highest first:
#   1. variables set on the container (docker run -e, compose `environment:` / `env_file:`)
#   2. files mounted into /app/config/*.env  (bind mount or volume from the host)
#   3. /app/defaults.env baked into the image
#
# Files are plain KEY=VALUE lines (# comments and blank lines allowed, optional surrounding quotes,
# no shell expansion). A variable is only taken from a file when it is not already set.
set -eu

load_env_file() {
  file=$1
  [ -f "$file" ] || return 0
  while IFS= read -r line || [ -n "$line" ]; do
    case $line in ''|'#'*) continue ;; esac
    key=${line%%=*}
    value=${line#*=}
    case $key in ''|*[!A-Za-z0-9_]*) echo "entrypoint: skipping malformed line in $file: $line" >&2; continue ;; esac
    case $value in
      \"*\") value=${value#\"}; value=${value%\"} ;;
      \'*\') value=${value#\'}; value=${value%\'} ;;
    esac
    if ! printenv "$key" >/dev/null 2>&1; then
      export "$key=$value"
    fi
  done < "$file"
}

for f in /app/config/*.env; do load_env_file "$f"; done
load_env_file /app/defaults.env

exec "$@"
