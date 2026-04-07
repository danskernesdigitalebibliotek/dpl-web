# This is the version of the Dpl Go application:
# In PR environments this should be updated whenever testing a new version:
FROM ghcr.io/danskernesdigitalebibliotek/dpl-go-node:lastest as builder

# Lagoon injects these automatically during build.
ARG LAGOON_ENVIRONMENT
ARG LAGOON_PROJECT

# Default CMS domain for non-PR environments.
# For PR environments, this is overridden dynamically using LAGOON_ENVIRONMENT
# and LAGOON_PROJECT (see RUN step below).
ARG GO_CMS_DOMAIN=cms-playground.dpl-cms.dplplat01.dpl.reload.dk

ARG DRUPAL_REVALIDATE_SECRET
ARG GO_SESSION_SECRET
ARG NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_PASSWORD
ARG UNLILOGIN_PUBHUB_RETAILER_ID=""
ARG UNLILOGIN_PUBHUB_RETAILER_KEY_CODE=""

ENV NEXT_TELEMETRY_DISABLED=1

# In PR environments, dynamically resolve GO_CMS_DOMAIN from Lagoon variables.
# This constructs the domain as: varnish.pr-<number>.<project>.dplplat02.dpl.reload.dk
# For non-PR environments, the default GO_CMS_DOMAIN is used.
RUN if [ -n "$LAGOON_ENVIRONMENT" ] && echo "$LAGOON_ENVIRONMENT" | grep -q "^pr-"; then \
      export GO_CMS_DOMAIN="varnish.${LAGOON_ENVIRONMENT}.${LAGOON_PROJECT}.dplplat02.dpl.reload.dk"; \
    fi && \
    export NEXT_PUBLIC_APP_URL="https://go.${GO_CMS_DOMAIN}" && \
    export NEXT_PUBLIC_DPL_CMS_HOSTNAME="${GO_CMS_DOMAIN}" && \
    export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="https://${GO_CMS_DOMAIN}/graphql" && \
    yarn run build

# Production image, copy all the files and run next
FROM uselagoon/node-20:latest AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=10000:10000 /app .

CMD ["/app/lagoon/start.sh"]
