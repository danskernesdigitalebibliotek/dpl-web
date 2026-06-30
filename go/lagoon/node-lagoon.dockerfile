# syntax=docker.io/docker/dockerfile:1
# Full build for the Go (Next.js) application within Lagoon.
# Used by Lagoon environments (PR, demo and playground).
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

FROM uselagoon/node-24:latest AS runner
# start.sh uses bash syntax ([[ ]]) not available in Alpine's default sh.
RUN apk add --no-cache bash

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=10000:10000 /app /app
WORKDIR /app/go

CMD ["lagoon/start.sh"]
