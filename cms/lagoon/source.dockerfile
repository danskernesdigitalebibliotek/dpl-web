# This docker file is for building the source image of the DPL Drupal Cms.
# The source image consists of a Drupal installation + custom code.
FROM dpl-cms-cli:0.0.0 as built-cli

RUN rm -fr /app/web/sites/default/files

FROM scratch
LABEL org.opencontainers.image.source https://github.com/danskernesdigitalebibliotek/dpl-cms
LABEL org.opencontainers.image.description="This package contains the source of the Danish Public Libraries Cms. NB: this is only the codebase and need other containers in order to run."

COPY --from=built-cli /app /app
