# Build base Dockerfile for deployment to lagoon.
FROM uselagoon/node-24-builder:latest
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
# Workspace packages are referenced from go/package.json via file: deps,
# so they must be copied into the image before pnpm install can resolve them.
COPY packages /app/packages
COPY package.json pnpm-* /app/
COPY go /app/go
WORKDIR /app
RUN corepack pnpm install --frozen-lockfile

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Bake the release version into a plain-text file at /app/VERSION. This
# survives the COPY --from=builder /app /app in node-lagoon.dockerfile (an
# ENV would not), so the runtime container can read it from the health endpoint.
ARG DPL_VERSION=unknown
RUN echo "${DPL_VERSION}" > /app/VERSION

WORKDIR /app/go
RUN corepack pnpm run build:stage1
