#!/usr/bin/env bash
set -euo pipefail

container=${1:?Container name required}
base_url=${2:?Base URL required}
healthy=false
for ((attempt = 0; attempt < 60; attempt++)); do
  status=$(docker inspect --format '{{.State.Health.Status}}' "$container")
  if [[ "$status" == healthy ]]; then
    healthy=true
    break
  fi
  if [[ "$status" == unhealthy ]] || [[ $(docker inspect --format '{{.State.Running}}' "$container") != true ]]; then
    break
  fi
  sleep 2
done
if [[ "$healthy" != true ]]; then
  docker logs --tail 80 "$container" >&2
  echo "Container did not become healthy: $container" >&2
  exit 1
fi
for path in /login /api/auth/session /api/auth/providers; do
  code=$(curl --silent --show-error --max-time 15 --output /dev/null \
    --write-out '%{http_code}' "$base_url$path")
  echo "$base_url$path: $code"
  [[ "$code" == 200 ]]
done