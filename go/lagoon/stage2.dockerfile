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
WORKDIR /app/packages/service-layer
RUN corepack pnpm prune --prod --no-optional

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
