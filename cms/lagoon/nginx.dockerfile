ARG CLI_IMAGE
FROM ${CLI_IMAGE} as cli

FROM uselagoon/nginx-drupal:latest

COPY --from=cli /app /app

COPY lagoon/conf/nginx/location_prepend_drupal_authorize.conf /etc/nginx/conf.d/drupal/location_prepend_drupal_authorize.conf
RUN fix-permissions /etc/nginx/conf.d/drupal/location_prepend_drupal_authorize.conf

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
