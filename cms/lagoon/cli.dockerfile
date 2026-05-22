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
# Ensure files folder exists and is writable by the Lagoon runtime group (10000).
RUN mkdir -p -v -m775 /app/cms/web/sites/default/files && chgrp -R 10000 /app/cms/web/sites/default/files

# Define where the Drupal Root is located. Lagoon prefixes this with /app/.
ENV WEBROOT=cms/web

# App lives in /app/cms, so its Composer bin dir must be on PATH for drush and
# other vendored binaries (the base image only adds /app/vendor/bin).
ENV PATH=/app/cms/vendor/bin:$PATH
