# This file combines go/lagoon/node.dockerfile and the old
# cms/lagoon/node.dockerfile.
FROM uselagoon/node-20-builder:latest AS builder

ARG LAGOON_ENVIRONMENT
ARG LAGOON_PROJECT
ARG GO_CMS_DOMAIN
ARG DRUPAL_REVALIDATE_SECRET
ARG GO_SESSION_SECRET
ARG NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_PASSWORD
ARG UNLILOGIN_PUBHUB_RETAILER_ID=""
ARG UNLILOGIN_PUBHUB_RETAILER_KEY_CODE=""

RUN env | sort
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn --frozen-lockfile

# In the build phase, we don't have access to the route yet, so we
# have to construct the URL on our own.
ENV BASE_URL="${LAGOON_ENVIRONMENT}.${LAGOON_PROJECT}.dplplat02.dpl.reload.dk"
ENV NEXT_PUBLIC_APP_URL="https://node.${BASE_URL}"
ENV NEXT_PUBLIC_DPL_CMS_HOSTNAME="varnish.${BASE_URL}"
ENV NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="https://varnish.${BASE_URL}/graphql"

RUN yarn run build

# Production image, copy all the files and run next
FROM uselagoon/node-20:latest AS runner
WORKDIR /app

# Propagate the build arguments as env variables to the runtime.
ENV DRUPAL_REVALIDATE_SECRET=$DRUPAL_REVALIDATE_SECRET
ENV GO_SESSION_SECRET=$GO_SESSION_SECRET
ENV UNLILOGIN_PUBHUB_RETAILER_ID=$UNLILOGIN_PUBHUB_RETAILER_ID
ENV BASE_URL="${LAGOON_ENVIRONMENT}.${LAGOON_PROJECT}.dplplat02.dpl.reload.dk"
ENV NEXT_PUBLIC_APP_URL="https://node.${BASE_URL}"
ENV NEXT_PUBLIC_DPL_CMS_HOSTNAME="varnish.${BASE_URL}"
ENV NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="https://varnish.${BASE_URL}/graphql"

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=10000:10000 /app .

CMD ["yarn", "start"]
