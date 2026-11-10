#!/usr/bin/env bash
# Installed by an administrator, never executed from an uploaded image.
set -euo pipefail
umask 077

if [[ ! ${SSH_ORIGINAL_COMMAND:-} =~ ^deploy\ ([0-9a-f]{40})$ ]]; then
  echo 'Only deploy <40-character commit SHA> is permitted' >&2
  exit 2
fi
revision=${BASH_REMATCH[1]}
base=/opt/visionproduction
deploy=$base/deployment
image=visionproduction-web:$revision
candidate=visionproduction-candidate
exec 9>"$deploy/deploy.lock"
flock -w 300 9 || { echo 'Another deployment holds the lock' >&2; exit 1; }

# Reject delayed/old workflow runs before accepting their image stream.
latest=$(curl --fail --silent --show-error --max-time 20 \
  https://api.github.com/repos/Winte-Arc-Myanmar/PointOfSaleAppFrontEnd/git/ref/heads/main \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["object"]["sha"])')
if [[ "$revision" != "$latest" ]]; then
  echo "Refusing stale deployment $revision; main is $latest" >&2
  exit 1
fi
available=$(df --output=avail -k "$base" | tail -1)
docker_root=$(docker info --format '{{.DockerRootDir}}')
docker_available=$(df --output=avail -k "$docker_root" | tail -1)
if (( available < 4194304 || docker_available < 4194304 )); then
  echo 'Less than 4 GiB available; refusing deployment without deleting rollback images' >&2
  exit 1
fi
for file in "$deploy/.env" "$base/current-release" "$base/source-revision.json"; do
  [[ -f "$file" ]] || { echo "Missing bootstrap file: $file" >&2; exit 1; }
done

release=$base/releases/$revision-$(date -u +%Y%m%d%H%M%S)
mkdir -p "$release"
switched=false
committed=false
compose=(docker compose --project-directory "$deploy" -f "$deploy/compose.yml")
cleanup() {
  result=$?
  trap - EXIT HUP INT TERM
  set +e
  if [[ "$switched" == true && "$committed" != true ]]; then
    echo 'Deployment failed; restoring previous image and release records' >&2
    if cp -p "$release/previous-deployment.env" "$deploy/.env" \
      && "${compose[@]}" up -d --wait --wait-timeout 150 web \
      && bash "$deploy/smoke-test.sh" visionproduction-web https://visionproduction.mmlnkits.com; then
      cp -p "$release/previous-current-release" "$base/current-release"
      cp -p "$release/previous-source-revision.json" "$base/source-revision.json"
    else
      touch "$release/rollback-failed"
      echo 'CRITICAL: automatic rollback failed; administrator intervention required' >&2
    fi
  fi
  docker rm -f "$candidate" >/dev/null 2>&1 || true
  rm -f "$release/image.tar.gz"
  exit "$result"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' HUP TERM

# Save the stream before loading so a truncated SSH upload cannot be deployed.
timeout 300 python3 -c '
import sys
limit = 512 * 1024 * 1024
total = 0
with open(sys.argv[1], "wb") as output:
    while True:
        chunk = sys.stdin.buffer.read(1024 * 1024)
        if not chunk:
            break
        total += len(chunk)
        if total > limit:
            raise SystemExit("Image upload exceeds 512 MiB limit")
        output.write(chunk)
' "$release/image.tar.gz"
gzip -t "$release/image.tar.gz"
# Preserve the actual running image before docker load can replace its SHA tag.
previous_image=$(docker inspect --format '{{.Image}}' visionproduction-web)
rollback_image=visionproduction-web:rollback-$(basename "$release")
docker tag "$previous_image" "$rollback_image"
gzip -dc "$release/image.tar.gz" | docker load
actual_revision=$(docker image inspect --format '{{index .Config.Labels "org.opencontainers.image.revision"}}' "$image")
[[ "$actual_revision" == "$revision" ]] || { echo 'Image revision mismatch' >&2; exit 1; }
docker rm -f "$candidate" >/dev/null 2>&1 || true
docker run -d --name "$candidate" --init --restart=no \
  -p 127.0.0.1:18083:3000 --env-file /etc/visionproduction/app.env \
  -e NODE_ENV=production -e AUTH_URL=https://visionproduction.mmlnkits.com \
  -e AUTH_TRUST_HOST=true -e NEXT_PUBLIC_API_URL=https://visionproduction.mmlnkits.com/api \
  --security-opt no-new-privileges:true --cap-drop ALL --memory 768m --cpus 1.5 \
  --log-opt max-size=10m --log-opt max-file=2 "$image"
bash "$deploy/smoke-test.sh" "$candidate" http://127.0.0.1:18083

printf 'APP_IMAGE=%s\n' "$rollback_image" > "$release/previous-deployment.env"
cp -p "$base/current-release" "$release/previous-current-release"
cp -p "$base/source-revision.json" "$release/previous-source-revision.json"
printf 'APP_IMAGE=%s\n' "$image" > "$deploy/.env.next"
switched=true
mv "$deploy/.env.next" "$deploy/.env"
"${compose[@]}" config --quiet
"${compose[@]}" up -d --wait --wait-timeout 150 web
bash "$deploy/smoke-test.sh" visionproduction-web https://visionproduction.mmlnkits.com
python3 - "$revision" "$release" > "$release/source-revision.json" <<'PY'
import json, sys
print(json.dumps({
    "repository": "Winte-Arc-Myanmar/PointOfSaleAppFrontEnd",
    "branch": "main",
    "commit": sys.argv[1],
    "release": sys.argv[2],
    "deployment": "GitHub Actions tested Docker image",
}, indent=2))
PY
cp "$release/source-revision.json" "$base/source-revision.json.next"
mv "$base/source-revision.json.next" "$base/source-revision.json"
printf '%s\n' "$release" > "$base/current-release.next"
mv "$base/current-release.next" "$base/current-release"
touch "$release/deploy-success"
committed=true
echo "DEPLOYMENT_SUCCESS $revision"