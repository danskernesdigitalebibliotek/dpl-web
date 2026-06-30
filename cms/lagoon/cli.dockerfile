# Stage 1: Build design-system and React assets.
# The built outputs are later copied into the PHP image so that Twig and
# other CMS code can find them at the expected paths.
FROM node:24-slim AS js-assets

RUN corepack enable
WORKDIR /app

# Skip downloading heavy binaries that are not needed for the build.
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV CYPRESS_INSTALL_BINARY=0
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copy workspace manifests so pnpm can resolve the full workspace during install.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY design-system/package.json ./design-system/
COPY react/package.json ./react/
COPY go/package.json ./go/
COPY packages/service-layer/package.json ./packages/service-layer/
COPY cms/package.json ./cms/

RUN pnpm install --frozen-lockfile

# Build design-system: compile SCSS, then assemble the build/ directory that
# CMS expects (mirrors the steps in the root Taskfile dev:design-system:build).
COPY design-system ./design-system/
RUN cd design-system && \
    pnpm run build && \
    rm -rf build && \
    mkdir -p build/js && \
    cp -r public/icons build/icons && \
    cp -r src/styles/css build/css && \
    cp -r src/styles/fonts build/fonts && \
    find src -name "*.js" | while read -r f; do cp "$f" build/js/"$(basename "$f")"; done

# Build React.
COPY react ./react/
RUN cd react && pnpm build

# Stage 2: PHP CLI image — the image that actually runs Drupal.
FROM uselagoon/php-8.3-cli-drupal:latest

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
