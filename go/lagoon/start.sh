# Set the environment variables.
# These ones are varying from environment to environment.
GO_SUB_DOMAIN="go."
# If primaryDomain uses www, then we want to put the go subdomain in there like this: www.go.restOfDomain.tld
PRIMARY_GO_DOMAIN="${GO_SUB_DOMAIN}${LAGOON_DOMAIN}"
if [[ $LAGOON_DOMAIN == www* ]]; then
  PRIMARY_GO_DOMAIN="${LAGOON_DOMAIN/www./www.$GO_SUB_DOMAIN}"
fi

export NEXT_PUBLIC_APP_URL="https://${PRIMARY_GO_DOMAIN}"
export NEXT_PUBLIC_DPL_CMS_HOSTNAME="${LAGOON_DOMAIN}"
export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="${LAGOON_ROUTE}/graphql"

# Go to the app directory if it doesn't exist then never mind.
cd /app || exit 1

yarn start
exit 0
