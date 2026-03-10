# NOTE This stage is a copy of cli.dockerfile. Anything from here and
# to the next FROM statement should be in sync with that file.
FROM uselagoon/php-8.3-cli-drupal:latest AS cli

# Make sure that every build has unique assets.
# By setting the build name as an ARG the following layers are not cached.
ARG LAGOON_BUILD_NAME

COPY composer.* /app/
COPY assets /app/assets
COPY packages /app/packages
COPY patches /app/patches
RUN COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev
COPY . /app
RUN mkdir -p -v -m775 /app/web/sites/default/files

# Define where the Drupal Root is located
ENV WEBROOT=web

FROM uselagoon/php-8.3-fpm:latest

COPY --from=cli /app /app
