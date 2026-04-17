#!/usr/bin/env bash

# NEXT_PUBLIC_* vars are inlined into the client JS bundle at build time
# (see node.dockerfile). These runtime exports only affect server-side
# rendering — they ensure SSR uses the correct URLs for the environment.

# "main" covers production sites, "develop" covers staging sites.
if [[ "$LAGOON_ENVIRONMENT" == "main" || "$LAGOON_ENVIRONMENT" == "develop" ]]; then
  GO_SUB_DOMAIN="go."
  PRIMARY_GO_DOMAIN="${GO_SUB_DOMAIN}${LAGOON_DOMAIN}"
  if [[ $LAGOON_DOMAIN == www* ]]; then
    PRIMARY_GO_DOMAIN="${LAGOON_DOMAIN/www./www.$GO_SUB_DOMAIN}"
  fi

  export NEXT_PUBLIC_APP_URL="https://${PRIMARY_GO_DOMAIN}"
  export NEXT_PUBLIC_DPL_CMS_HOSTNAME="${LAGOON_DOMAIN}"
  export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="${LAGOON_ROUTE}/graphql"
else
  BASE_DOMAIN="${LAGOON_ENVIRONMENT}.${LAGOON_PROJECT}.dplplat02.dpl.reload.dk"
  export NEXT_PUBLIC_APP_URL="https://node.${BASE_DOMAIN}"
  export NEXT_PUBLIC_DPL_CMS_HOSTNAME="varnish.${BASE_DOMAIN}"
  export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="https://varnish.${BASE_DOMAIN}/graphql"
fi

cd /app || exit 1

exec pnpm run start
