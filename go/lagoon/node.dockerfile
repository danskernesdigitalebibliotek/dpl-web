# syntax=docker.io/docker/dockerfile:1
# Full build for the Go (Next.js) application.
# Lagoon builds this directly — no external pre-built image needed.
# Based on: https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM uselagoon/node-20-builder:latest AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Lagoon injects these automatically during build.
ARG LAGOON_ENVIRONMENT
ARG LAGOON_PROJECT

ARG DRUPAL_REVALIDATE_SECRET
ARG GO_SESSION_SECRET
ARG NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_PASSWORD
ARG UNLILOGIN_PUBHUB_RETAILER_ID=""
ARG UNLILOGIN_PUBHUB_RETAILER_KEY_CODE=""

ENV NEXT_TELEMETRY_DISABLED=1

RUN BASE_DOMAIN="${LAGOON_ENVIRONMENT}.${LAGOON_PROJECT}.dplplat02.dpl.reload.dk" && \
    GO_CMS_DOMAIN="varnish.${BASE_DOMAIN}" && \
    export NEXT_PUBLIC_APP_URL="https://node.${BASE_DOMAIN}" && \
    export NEXT_PUBLIC_DPL_CMS_HOSTNAME="${GO_CMS_DOMAIN}" && \
    export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="https://${GO_CMS_DOMAIN}/graphql" && \
    yarn run build

# Production image
FROM uselagoon/node-20:latest AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=10000:10000 /app .

CMD ["/app/lagoon/start.sh"]
