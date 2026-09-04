# syntax=docker.io/docker/dockerfile:1
# Stage 1 of the Lagoon build: install dependencies and run the
# environment-independent compile (`build:stage1`). Published to GHCR by CI;
# stage2.dockerfile builds FROM the result. See ./README.md.
FROM uselagoon/node-24-builder:latest
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Workspace packages are referenced from go/package.json via file: deps,
# so they must be copied into the image before pnpm install can resolve them.
COPY packages /app/packages
# .npmrc carries the registry mapping for the @wedobooks scope. Only the
# mapping - nothing from that registry is installed here (see below), and the
# credential never enters this image.
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
# Only Go's slice of the workspace is installed. That is what keeps
# WeDoBooks' SDK out of this image: the image is publicly pullable, and Go
# does not consume the SDK yet - so neither the proprietary package nor the
# token for their private registry has any business in it. Go is expected to
# reach WeDoBooks through the service layer eventually; the day that
# dependency lands, this install fails loudly, and two things must be
# settled together: the token has to arrive as a BuildKit secret - never a
# build argument, since unlike the CMS images the installing stage here is
# the published one - and the image's public visibility has to be
# reconsidered, because it would then redistribute the SDK.
RUN pnpm install --frozen-lockfile --filter @danskernesdigitalebibliotek/dpl-go...

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Bake the release version into a plain-text file at /app/VERSION. This
# survives the COPY --from=builder /app /app in stage2.dockerfile (an
# ENV would not), so the runtime container can read it from the health endpoint.
ARG DPL_VERSION=unknown
RUN echo "${DPL_VERSION}" > /app/VERSION

WORKDIR /app/go
RUN corepack pnpm run build:stage1
