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

COPY composer.* /app/
COPY assets /app/assets
COPY packages /app/packages
COPY patches /app/patches
RUN if [ "$SKIP_COMPOSER_INSTALL" != "true" ]; then COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev; fi
COPY . /app
RUN mkdir -p -v -m775 /app/web/sites/default/files

# Define where the Drupal Root is located
ENV WEBROOT=web
