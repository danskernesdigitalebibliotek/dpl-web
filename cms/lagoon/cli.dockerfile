# Stage 1: Build design-system and React assets.
# The built outputs are later copied into the PHP image so that Twig and
# other CMS code can find them at the expected paths.
FROM node:24-slim AS js-assets

# In CI/dev, /app is volume-mounted from the host so baked-in assets are
# hidden. Skip the expensive builds there; keep the output dirs so the
# COPY --from below still works.
ARG SKIP_JS_ASSETS=false

RUN corepack enable
WORKDIR /app

# Skip downloading heavy binaries that are not needed for the build.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV CYPRESS_INSTALL_BINARY=0
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copy workspace manifests so pnpm can resolve the full workspace during install.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY design-system/package.json design-system/pnpm-lock.yaml ./design-system/
COPY react/package.json react/pnpm-lock.yaml ./react/
COPY go/package.json go/pnpm-lock.yaml ./go/
COPY packages/service-layer/package.json packages/service-layer/pnpm-lock.yaml ./packages/service-layer/
COPY packages/wedobooks/package.json packages/wedobooks/pnpm-lock.yaml ./packages/wedobooks/
# Maps the @wedobooks scope to their private registry, which serves the SDK
# behind the reader and the player.
COPY .npmrc ./
COPY cms/package.json cms/pnpm-lock.yaml ./cms/

# Read-only token for WeDoBooks' private npm registry, which serves the SDK
# behind the reader and the player. It stays inside this build stage, which is
# thrown away once its output has been copied into the runtime image below, so
# it never reaches a published layer.
#
# It is written to the user-level npm config rather than the repository's
# .npmrc, which carries only the scope mapping - the credential stays out of
# the committed file.
ARG WEDOBOOKS_NPM_TOKEN
RUN if [ "$SKIP_JS_ASSETS" != "true" ]; then \
    npm config set "//npm.pkg.wedobooks.io/:_authToken" "$WEDOBOOKS_NPM_TOKEN" && \
    pnpm install --frozen-lockfile; \
    fi

# Build design-system: compile SCSS, then assemble the build/ directory that
# CMS expects (mirrors the steps in the root Taskfile dev:design-system:build).
COPY design-system ./design-system/
RUN if [ "$SKIP_JS_ASSETS" = "true" ]; then mkdir -p design-system/build; else \
    cd design-system && \
    pnpm run build && \
    rm -rf build && \
    mkdir -p build/js && \
    cp -r public/icons build/icons && \
    cp -r src/styles/css build/css && \
    cp -r src/styles/fonts build/fonts && \
    find src -name "*.js" | while read -r f; do cp "$f" build/js/"$(basename "$f")"; done; \
    fi

# Workspace packages consumed by React ship raw TypeScript, so their source
# has to be present in the image - the manifest copied above only lets pnpm
# link them during install.
COPY packages ./packages/

# The WeDoBooks wrapper pre-bundles the SDK, so unlike the other workspace
# packages it has to be built before anything can import it.
RUN if [ "$SKIP_JS_ASSETS" != "true" ]; then pnpm --filter @danskernesdigitalebibliotek/dpl-wedobooks build; fi

# Build React.
COPY react ./react/
RUN if [ "$SKIP_JS_ASSETS" = "true" ]; then mkdir -p react/dist; else cd react && pnpm build; fi

# Stage 2: PHP CLI image — the image that actually runs Drupal.
FROM uselagoon/php-8.4-cli-drupal:latest

# NOTE Changes to this file should be reflected in php.dockerfile and
# nginx.dockerfile. See DDFNEXT-1368 as to why we ended up here rather
# than the standard Lagoon way of doing things.

# Make sure that every build has unique assets.
# By setting the build name as an ARG the following layers are not cached.
ARG LAGOON_BUILD_NAME

# In CI/dev, /app is volume-mounted from the host so baked-in vendor is hidden.
# Skip composer install there to avoid wasted build time.
ARG SKIP_COMPOSER_INSTALL=false

RUN mkdir -p /app/cms
WORKDIR /app/cms
COPY cms/composer.* /app/cms/
COPY cms/assets /app/cms/assets
COPY cms/packages /app/cms/packages
COPY cms/patches /app/cms/patches
RUN if [ "$SKIP_COMPOSER_INSTALL" != "true" ]; then COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev; fi
COPY cms /app/cms

# Copy the JS-built assets into their expected CMS locations.
# These paths are gitignored, so they are not present in the COPY cms step above.
COPY --from=js-assets /app/design-system/build /app/cms/web/themes/custom/novel/assets/dpl-design-system
COPY --from=js-assets /app/react/dist /app/cms/web/libraries/dpl-react

# Ensure files folder exists and is writable by the Lagoon runtime group (10000).
RUN mkdir -p -v -m775 /app/cms/web/sites/default/files && chgrp -R 10000 /app/cms/web/sites/default/files

# Define where the Drupal Root is located. Lagoon prefixes this with /app/.
ENV WEBROOT=cms/web

# App lives in /app/cms, so its Composer bin dir must be on PATH for drush and
# other vendored binaries (the base image only adds /app/vendor/bin).
ENV PATH=/app/cms/vendor/bin:$PATH
