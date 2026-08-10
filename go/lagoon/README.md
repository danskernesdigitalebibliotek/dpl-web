# Dockerfiles

This directory contains the Dockerfile and startup script for the Go (Next.js)
application deployed via Lagoon.

The build is split in two, so the expensive dependency install and the
environment-independent compile happen once per commit rather than once per
environment. The file names line up with the `build:stage1` / `build:stage2`
scripts in `go/package.json` that they each run:

- `stage1.dockerfile` installs dependencies from the repo root context and runs
  `build:stage1` (`next build --experimental-build-mode=compile`). CI publishes
  the result to `ghcr.io/danskernesdigitalebibliotek/dpl-web-go:<tag>` — see
  `.github/workflows/go-build-base-image.yml`.
- `stage2.dockerfile` is what Lagoon builds per environment. It starts `FROM`
  the stage-1 image above, runs `build:stage2`
  (`next build --experimental-build-mode=generate`) with the environment's build
  args, and produces the production runtime image. It is wired up in
  `docker-compose.lagoon.yml`.

`start.sh` sets runtime environment variables and starts the Next.js server.
