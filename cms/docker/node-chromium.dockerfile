# Remember to update .nvmrc and @types/node if updating to a new Node version.
#
# Pinned by digest: the floating ":latest" tag drifts, and a newer base image
# stopped shipping the corepack `pnpm` shim, which breaks the `pnpm` invocations
# in the CI tasks (e.g. wiremock:create-mappings) with "pnpm: not found". Bump
# this digest deliberately when updating the base image.
FROM uselagoon/node-24-builder:latest@sha256:3eb5ef033b9f42b99edeeca884e42bddebb535a8057091485156b0c619bdc68e

ENV CI=1

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apk update \
    && apk add chromium \
    && rm -rf /var/cache/apk/*
RUN corepack enable
