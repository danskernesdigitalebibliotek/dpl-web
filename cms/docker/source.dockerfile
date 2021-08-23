# This docker file is for building the source image of the DPL Drupal Cms.
# The source image consists of a Drupal installation + custom code.
FROM uselagoon/php-7.4-cli-drupal:latest as builder

COPY composer.* /app/
COPY assets /app/assets
RUN COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev
COPY . /app

FROM scratch
LABEL org.opencontainers.image.source https://github.com/danskernesdigitalebibliotek/dpl-cms

COPY --from=builder /app /app
