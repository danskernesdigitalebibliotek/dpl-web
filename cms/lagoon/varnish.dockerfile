FROM uselagoon/varnish-6-drupal:latest

USER root

COPY lagoon/varnish/drupal.vcl /etc/varnish/default.vcl
RUN fix-permissions /etc/varnish/default.vcl

USER varnish
