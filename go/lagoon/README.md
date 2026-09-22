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

## The WeDoBooks credential

Both stages need a token for WeDoBooks' private npm registry — stage 1 for the
`pnpm install`, stage 2 for the `pnpm prune` passes, which resolve every
workspace lockfile against its registry. They get it two different ways, and
the difference is not incidental:

- **Stage 1 takes a BuildKit secret** (`--mount=type=secret`). This Dockerfile
  has a single stage, and that stage is what gets published, so a build
  argument would be readable from `docker history` and an `npm config set`
  would leave the token in a shipped layer. `.github/workflows/go-build-base-image.yml`
  passes it through `docker/build-push-action`'s `secrets:` input.
- **Stage 2 takes a build argument**, which it hands to pnpm as an
  `npm_config_*` environment variable rather than writing an `.npmrc`. Lagoon
  builds with `docker build --build-arg` and cannot pass secrets. That is safe
  here because the credential stays in the `builder` stage — the runner copies
  `/app` and nothing else — and keeping it in the environment means it is
  never written to a layer at all. It reaches the build from a Lagoon project
  variable of the same name, wired up in `docker-compose.lagoon.yml`.

`task -d go lagoon:stage1:build` builds stage 1 locally with the token from
the central `.env`, which is the quickest way to check that neither the
install nor the leak-proofing has regressed.
