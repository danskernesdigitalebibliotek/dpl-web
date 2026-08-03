# Dockerfiles

This directory contains the Dockerfile and startup script for the Go (Next.js)
application deployed via Lagoon.

The build is split in two, so the expensive dependency install and
environment-independent build happen once per commit rather than once per
environment:

- `base.dockerfile` installs dependencies from the repo root context and runs
  `build:stage1`. CI publishes it to
  `ghcr.io/danskernesdigitalebibliotek/dpl-web-go:<tag>` — see
  `.github/workflows/go-build-base-image.yml`.
- `node-lagoon.dockerfile` is what Lagoon builds per environment. It starts
  `FROM` the base image above, runs `build:stage2` with the environment's build
  args, and produces the production runtime image. It is wired up in
  `docker-compose.lagoon.yml`.

`start.sh` sets runtime environment variables and starts the Next.js server.
