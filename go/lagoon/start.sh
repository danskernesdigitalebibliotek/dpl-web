# Set the environment variables.
# These ones are varying from environment to environment.
export NEXT_PUBLIC_APP_URL="https://go.${LAGOON_DOMAIN}"
export NEXT_PUBLIC_DPL_CMS_HOSTNAME="${LAGOON_DOMAIN}"
export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="${LAGOON_ROUTE}/graphql"

# Go to the app directory if it doesn't exist then never mind.
cd /app || exit 1

node server.js
exit 0
