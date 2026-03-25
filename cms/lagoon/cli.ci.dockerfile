FROM uselagoon/php-8.3-cli-drupal:latest

RUN mkdir -p -v -m775 /app/web/sites/default/files

ENV WEBROOT=web
