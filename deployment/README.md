# Production CI/CD

`.github/workflows/production.yml` builds pull requests targeting `main`. Pushes to
`main` and manual runs on `main` build, test, and deploy the exact same Docker image
to `visionproduction.mmlnkits.com`. Other branches cannot deploy.

## Pipeline

1. Validate shell scripts; build using `npm ci` and the committed lockfile.
2. Run the Next.js production build, including TypeScript validation.
3. Start the image with an ephemeral test auth secret; check Docker health and
   `/login`, `/api/auth/session`, and `/api/auth/providers`.
4. Store the tested image as a short-lived GitHub artifact (no production secrets).
5. Serialize production jobs and stream the image over host-key-verified SSH.
6. The server rejects stale commits, checks disk space and image revision, tests
   a candidate container, and replaces only `visionproduction-web`.
7. Failed post-switch checks restore the previous image and release records.
   Failed builds/candidate checks leave production unchanged.

Application runtime secrets stay in `/etc/visionproduction/app.env`. Nginx, backend,
database, certificates, and other containers are not managed by this workflow.
The site may have a brief interruption while Compose replaces the container;
this is not a zero-downtime or database-migration pipeline. Smoke tests do not
replace authenticated business-flow or backend compatibility tests.

## GitHub configuration

Create the `production` environment with a deployment branch policy allowing
only `main`. Store these **environment secrets**, not passwords in the repository:

| Secret | Value |
| --- | --- |
| `PRODUCTION_SSH_PRIVATE_KEY` | Dedicated Ed25519 deployment private key |
| `PRODUCTION_SSH_KNOWN_HOSTS` | Verified `118.27.147.101 ssh-ed25519 ...` host-key line |

Actions must be enabled, and the repository/organization must permit the pinned
checkout, upload-artifact, and download-artifact actions. Production deploys are
automatic; adding required environment reviewers will deliberately require approval.
Protect `main` with a PR requirement and the `Build and smoke test` status check
if your team wants failed PR checks to block merges. Do not require the deploy job
on PRs: it deliberately does not run there.

## Server bootstrap and script maintenance

The administrator installs the reviewed scripts and Compose file at:

```text
/opt/visionproduction/deployment/deploy.sh
/opt/visionproduction/deployment/smoke-test.sh
/opt/visionproduction/deployment/compose.yml
```

Make scripts root-owned and executable. Preserve the existing `.env` containing
`APP_IMAGE`, `/opt/visionproduction/current-release`, and
`/opt/visionproduction/source-revision.json`. The server needs Bash, Python 3,
curl, gzip, flock, timeout, Docker, and Docker Compose. Outbound HTTPS access to
GitHub's public API is required for the `main` freshness check; it fails closed
if GitHub is unavailable/rate-limited. A private repository needs an authenticated
replacement for that check before changing repository visibility.

Append the dedicated key's **public** half to `/root/.ssh/authorized_keys` with:

```text
restrict,command="/opt/visionproduction/deployment/deploy.sh" ssh-ed25519 PUBLIC_KEY github-actions-visionproduction
```

This key cannot open an interactive shell, forward ports, or choose arbitrary
commands. It can deploy application images with production runtime credentials;
protect it as a production credential. Keep normal administrator access separate.
Do not add the key to the Docker group or enable password login for Actions.
Workflow/script changes must be reviewed as privileged deployment code. The
workflow deliberately does not overwrite the trusted server scripts automatically;
an administrator must install reviewed updates to those three files.

## Manual deployment and recovery

Use **Actions → Production CI/CD → Run workflow → main** to rebuild/redeploy main.
Open a failed run's logs; deployment and public HTTPS checks fail the run visibly.
Configure GitHub Actions notifications for failures in your GitHub notification
settings. No external alerting integration is installed by this pipeline.

Each deployment records its image/commit and saves previous deployment settings
under `/opt/visionproduction/releases/`. To roll back manually, as an administrator:

```bash
sudo -i
exec 9>/opt/visionproduction/deployment/deploy.lock
flock -w 300 9
release=$(cat /opt/visionproduction/current-release)
test -f "$release/previous-deployment.env"
cp -p "$release/previous-deployment.env" /opt/visionproduction/deployment/.env
docker compose --project-directory /opt/visionproduction/deployment \
  -f /opt/visionproduction/deployment/compose.yml up -d --wait --wait-timeout 150 web
cp -p "$release/previous-current-release" /opt/visionproduction/current-release
cp -p "$release/previous-source-revision.json" /opt/visionproduction/source-revision.json
bash /opt/visionproduction/deployment/smoke-test.sh \
  visionproduction-web https://visionproduction.mmlnkits.com
```

Do not run an automatic deployment while investigating a rollback. The next push
or manual run deploys current main again. Images are intentionally retained for
rollback; monitor disk space and explicitly remove only unused old application
image tags after reviewing rollback needs. The deploy refuses to start below
4 GiB free on either the release or Docker filesystem; compressed uploads are
limited to 512 MiB. Never run a broad `docker system prune --volumes` on this server.

The final external HTTPS check is monitoring: if it fails after the server has
committed its release, the run fails but does not initiate a second rollback.
Investigate external DNS/network failures before using the manual rollback steps.

Rotate the dedicated key by installing a second restricted public key, replacing
the environment secret, validating a deployment, then removing the old key.
Rotate the root password previously shared in chat separately.