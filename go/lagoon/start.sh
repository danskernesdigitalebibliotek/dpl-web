# Set the environment variables.
# These ones are varying from environment to environment.

# For PR environments, ensure CMS communication goes through varnish
# These should already be set at build time via cms/lagoon/node.dockerfile,
# but we set them here as well for runtime consistency
if [[ "$LAGOON_ENVIRONMENT" =~ ^pr- ]]; then
  # PR environments: CMS is at varnish.pr-XXX.project.domain
  # NEXT_PUBLIC_APP_URL should already be set correctly at build time
  export NEXT_PUBLIC_DPL_CMS_HOSTNAME="varnish.${LAGOON_ENVIRONMENT}.${LAGOON_PROJECT}.dplplat02.dpl.reload.dk"
  export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="https://varnish.${LAGOON_ENVIRONMENT}.${LAGOON_PROJECT}.dplplat02.dpl.reload.dk/graphql"
else
  # Non-PR environments: Standard go.domain pattern
  GO_SUB_DOMAIN="go."
  # If primaryDomain uses www, then we want to put the go subdomain in there like this: www.go.restOfDomain.tld
  PRIMARY_GO_DOMAIN="${GO_SUB_DOMAIN}${LAGOON_DOMAIN}"
  if [[ $LAGOON_DOMAIN == www* ]]; then
    PRIMARY_GO_DOMAIN="${LAGOON_DOMAIN/www./www.$GO_SUB_DOMAIN}"
  fi

  export NEXT_PUBLIC_APP_URL="https://${PRIMARY_GO_DOMAIN}"
  export NEXT_PUBLIC_DPL_CMS_HOSTNAME="${LAGOON_DOMAIN}"
  export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="${LAGOON_ROUTE}/graphql"
fi

# Go to the app directory if it doesn't exist then never mind.
cd /app || exit 1

yarn start
exit 0
