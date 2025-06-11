# This is the version of the Dpl Go application:
# https://github.com/danskernesdigitalebibliotek/dpl-go
# In PR environments this should be updated whenever testing a new version:
FROM ghcr.io/danskernesdigitalebibliotek/dpl-go-node:0.25.24 as builder

# This is an important variable.
# It is used both to resolve the url for the DPL CMS, the DPL CMS Graphql endpoint, and the Next.js app URL.
# All the args here are only used for the next building phase.
# In PR environments this should be updated to match the cms domain of the environment.
ARG GO_CMS_DOMAIN=cms-playground.dpl-cms.dplplat01.dpl.reload.dk

ARG DRUPAL_REVALIDATE_SECRET
ARG GO_SESSION_SECRET
ARG NEXT_PUBLIC_APP_URL="https://go.${GO_CMS_DOMAIN}"
ARG NEXT_PUBLIC_DPL_CMS_HOSTNAME="${GO_CMS_DOMAIN}"
ARG NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_NAME
ARG NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_PASSWORD
ARG NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="https://${GO_CMS_DOMAIN}/graphql"
ARG UNLILOGIN_PUBHUB_CLIENT_ID
ARG UNLILOGIN_PUBHUB_RETAILER_ID

RUN echo "Building DPL Go Node image with the following environment variables (1643)"
RUN printenv

ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn run build

# Production image, copy all the files and run next
FROM uselagoon/node-20:latest AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=10000:10000 /app .

CMD ["/app/lagoon/start.sh"]
