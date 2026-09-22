# syntax=docker.io/docker/dockerfile:1
# Stage 2 of the Lagoon build: the per-environment build, on top of the image
# produced by stage1.dockerfile. Runs `build:stage2` with the environment's
# build args and produces the production runtime image.
# Used by Lagoon environments (PR, demo and playground). See ./README.md.
# Based on: https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile


# For pull requests, LAGOON_ENVIRONMENT will match our Docker image tags `pr-123`.
# For branch environments (playground, demo), etc. it should match the branch
# name itself, which should also match our Docker image tags.
ARG LAGOON_ENVIRONMENT
FROM ghcr.io/danskernesdigitalebibliotek/dpl-web-go:$LAGOON_ENVIRONMENT AS builder
WORKDIR /app/go

# Lagoon injects these automatically during build.
ARG LAGOON_ENVIRONMENT
ARG LAGOON_PROJECT
ARG LAGOON_ROUTE
ARG LAGOON_ROUTES

ARG DRUPAL_REVALIDATE_SECRET
ARG GO_SESSION_SECRET
ARG NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_PASSWORD
ARG UNLILOGIN_PUBHUB_RETAILER_ID=""
ARG UNLILOGIN_PUBHUB_RETAILER_KEY_CODE=""

# Credential for WeDoBooks' private npm registry, which serves the SDK behind
# the reader and the player. The prunes below take no filter and so resolve
# every workspace lockfile against its registry; packages/wedobooks needs this
# to come back with anything but a 401.
#
# A build argument rather than the BuildKit secret stage1.dockerfile uses:
# Lagoon builds with `docker build --build-arg` and has no way to pass a
# secret. Safe here, where it is not in stage 1, because this is the builder
# stage - the runner below copies /app and nothing else, so neither the
# argument nor the environment variable reaches the published image.
#
# Handed to pnpm as a config key in the environment rather than written with
# `npm config set`, which would leave the token in an .npmrc in this layer -
# safe only for as long as nobody widens that COPY. pnpm takes any config key
# from the environment as npm_config_<key>; same mechanism as `init:pnpm` in
# the root Taskfile and the secret mount in stage 1.
ARG WEDOBOOKS_NPM_TOKEN
ENV npm_config_//npm.pkg.wedobooks.io/:_authToken=$WEDOBOOKS_NPM_TOKEN

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN node ./scripts/prepare-docker-env-vars.mjs && \
    corepack pnpm run build:stage2

# Drop devDependencies before the runner stage copies /app, so Storybook,
# Cypress, Vitest and the rest of the build-time tooling do not ship to
# production.
#
# Must run from /app/go, not the workspace root: with sharedWorkspaceLockfile
# disabled, `pnpm prune` at /app only considers the root project — which has no
# dependencies at all — and silently leaves go's node_modules untouched.
#
# Deliberately no --no-optional. sharp's native binaries
# (@img/sharp-linuxmusl-x64 and @img/sharp-libvips-linuxmusl-x64) are
# optionalDependencies, and pruning them makes `require("sharp")` throw
# "Could not load the sharp module", which breaks next/image at request time.
RUN corepack pnpm prune --prod

# The service-layer workspace package ships in the image as well (go imports it
# through a file: dependency) and carries its own eslint/orval/vite/vitest tree.
#
# No --no-optional here either, for the reason given above and for the same
# binaries: the virtual store is shared across the workspace, so pruning
# optional dependencies from this package reaches into go's sharp as well.
# Under pnpm 10 it did not; under pnpm 11 it does, and `require("sharp")`
# below is what catches it.
WORKDIR /app/packages/service-layer
RUN corepack pnpm prune --prod

# The WeDoBooks wrapper ships in the image for the same reason, and carries
# esbuild and the SDK's own build-time tree.
WORKDIR /app/packages/wedobooks
RUN corepack pnpm prune --prod

WORKDIR /app/go
# Fail the build here rather than at runtime if pruning took too much or too
# little. start.sh execs the `next` binary directly, and Next.js needs sharp for
# image optimization.
RUN test -x node_modules/.bin/next \
    && node -e "require('sharp')" \
    && test ! -e node_modules/cypress \
    && test ! -e /app/packages/service-layer/node_modules/vitest

FROM uselagoon/node-24:latest AS runner
# start.sh uses bash syntax ([[ ]]) not available in Alpine's default sh.
RUN apk add --no-cache bash

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=10000:10000 /app /app
WORKDIR /app/go

CMD ["lagoon/start.sh"]
