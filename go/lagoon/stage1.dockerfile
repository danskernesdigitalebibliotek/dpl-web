# syntax=docker.io/docker/dockerfile:1
# Stage 1 of the Lagoon build: install dependencies and run the
# environment-independent compile (`build:stage1`). Published to GHCR by CI;
# stage2.dockerfile builds FROM the result. See ./README.md.
FROM uselagoon/node-24-builder:latest
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Workspace packages are referenced from go/package.json via file: deps, so
# they must be copied into the image before pnpm install can resolve them.
#
# All of them, not just the ones Go names. The filter below keeps the install
# itself to Go's slice, but `pnpm prune` in stage 2 takes no filter and walks
# every workspace package it finds - so one missing here fails the prune
# rather than the install, a long way from the cause.
COPY packages /app/packages
# .npmrc carries the registry mapping for the @wedobooks and @colibrio scopes.
# Only the mapping - the credential stays out of the repository and reaches
# pnpm through the secret mount below.
COPY package.json pnpm-* .npmrc /app/
COPY go /app/go
WORKDIR /app

# The install below happens before NODE_ENV=production is set, so it pulls in
# devDependencies (needed by the build). Skip the browser binaries those test
# tools would otherwise download — nothing in the build runs a browser.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV CYPRESS_INSTALL_BINARY=0
# pnpm asks for confirmation before purging the modules directory, and a
# docker build has no TTY to answer with - nor does it inherit CI from the
# runner. Saying so lets the filtered install below run unattended.
ENV CI=true

# Corepack to install pnpm.
RUN corepack enable
# Only Go's slice of the workspace is installed - the filter widens by itself
# as Go takes on more workspace packages, including packages/wedobooks and
# with it WeDoBooks' SDK.
#
# The credential for WeDoBooks' private registry arrives as a BuildKit secret,
# never as a build argument. Unlike the CMS images, this stage is the one that
# gets published: a build argument would surface in `docker history`, and an
# `npm config set` would leave the token in the user npmrc (/home/.npmrc in
# these images) in a shipped layer. A
# secret mount is readable only for the duration of this RUN and lands in no
# layer at all. stage2.dockerfile has to use a build argument instead, because
# Lagoon builds with `docker build --build-arg` and cannot pass secrets - it
# gets away with it by keeping the credential in a stage that is discarded.
#
# `env` sets the config key because its name contains `/` and `:`, which no
# shell will accept as a variable name. Same trick as `init:pnpm` in the root
# Taskfile.
RUN --mount=type=secret,id=WEDOBOOKS_NPM_TOKEN \
    env "npm_config_//npm.pkg.wedobooks.io/:_authToken=$(cat /run/secrets/WEDOBOOKS_NPM_TOKEN)" \
    pnpm install --frozen-lockfile --filter @danskernesdigitalebibliotek/dpl-go...

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Bake the release version into a plain-text file at /app/VERSION. This
# survives the COPY --from=builder /app /app in stage2.dockerfile (an
# ENV would not), so the runtime container can read it from the health endpoint.
ARG DPL_VERSION=unknown
RUN echo "${DPL_VERSION}" > /app/VERSION

WORKDIR /app/go
RUN corepack pnpm run build:stage1
