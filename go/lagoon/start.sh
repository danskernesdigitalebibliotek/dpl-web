# Set the environment variables.
# These ones are varying from environment to environment.

if [[ "$LAGOON_ENVIRONMENT" == "main" || "$LAGOON_ENVIRONMENT" == "develop" ]]; then
  # Production-like environments: use Lagoon-provided domain/route.
  GO_SUB_DOMAIN="go."
  PRIMARY_GO_DOMAIN="${GO_SUB_DOMAIN}${LAGOON_DOMAIN}"
  if [[ $LAGOON_DOMAIN == www* ]]; then
    PRIMARY_GO_DOMAIN="${LAGOON_DOMAIN/www./www.$GO_SUB_DOMAIN}"
  fi

  export NEXT_PUBLIC_APP_URL="https://${PRIMARY_GO_DOMAIN}"
  export NEXT_PUBLIC_DPL_CMS_HOSTNAME="${LAGOON_DOMAIN}"
  export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="${LAGOON_ROUTE}/graphql"
else
  # Dynamic environments (PR, playground, etc.): derive from Lagoon variables.
  export NEXT_PUBLIC_APP_URL="https://go.${LAGOON_ENVIRONMENT}.${LAGOON_PROJECT}.dplplat02.dpl.reload.dk"
  export NEXT_PUBLIC_DPL_CMS_HOSTNAME="varnish.${LAGOON_ENVIRONMENT}.${LAGOON_PROJECT}.dplplat02.dpl.reload.dk"
  export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="https://varnish.${LAGOON_ENVIRONMENT}.${LAGOON_PROJECT}.dplplat02.dpl.reload.dk/graphql"
fi

# Go to the app directory if it doesn't exist then never mind.
cd /app || exit 1

yarn start
exit 0
