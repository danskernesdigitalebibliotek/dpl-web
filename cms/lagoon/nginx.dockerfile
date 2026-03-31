# NOTE This stage is a copy of cli.dockerfile. Anything from here and
# to the next FROM statement should be in sync with that file.
FROM uselagoon/php-8.3-cli-drupal:latest AS cli

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

FROM uselagoon/nginx-drupal:latest

COPY --from=cli /app /app

COPY lagoon/conf/nginx/location_prepend_drupal_authorize.conf /etc/nginx/conf.d/drupal/location_prepend_drupal_authorize.conf
RUN fix-permissions /etc/nginx/conf.d/drupal/location_prepend_drupal_authorize.conf

COPY lagoon/conf/nginx/location_prepend_drupal_update.conf /etc/nginx/conf.d/drupal/location_prepend_drupal_update.conf
RUN fix-permissions /etc/nginx/conf.d/drupal/location_prepend_drupal_update.conf

COPY lagoon/conf/nginx/server_append_drupal_authorize.conf /etc/nginx/conf.d/drupal/server_append_drupal_authorize.conf
RUN fix-permissions /etc/nginx/conf.d/drupal/server_append_drupal_authorize.conf

COPY lagoon/conf/nginx/server_append_drupal_modules_local.conf /etc/nginx/conf.d/drupal/server_append_drupal_modules_local.conf
RUN fix-permissions /etc/nginx/conf.d/drupal/server_append_drupal_modules_local.conf

COPY lagoon/conf/nginx/server_append_drupal_rewrite_registration.conf /etc/nginx/conf.d/drupal/server_append_drupal_rewrite_registration.conf
RUN fix-permissions /etc/nginx/conf.d/drupal/server_append_drupal_rewrite_registration.conf

COPY lagoon/conf/nginx/server_append_drupal_rewrite_legacy_search_works.conf /etc/nginx/conf.d/drupal/server_append_drupal_rewrite_legacy_search_works.conf
RUN fix-permissions /etc/nginx/conf.d/drupal/server_append_drupal_rewrite_legacy_search_works.conf

# Define where the Drupal Root is located
ENV WEBROOT=web
