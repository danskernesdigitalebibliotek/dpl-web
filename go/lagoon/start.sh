getLagoonUrl() {
  local type=$1

  for route in ${LAGOON_ROUTES//,/ }; do
    if echo "$route" | grep -q "$type"; then
      echo "$route"
      return
    fi
  done
}

# Make sure app.url is set in application
goUrlPrefix="go."
# If the project is "dpl-cms", we are running in a PR environment
# and then the goUrlPrefix should be go-.
# Otherwise we are in production and the goUrlPrefix should be "go.".
if [ "$LAGOON_PROJECT" = "dpl-cms" ]; then
  goUrlPrefix="go-"
fi
app_url=$(getLagoonUrl $goUrlPrefix)
if [ -z "$app_url" ]; then
  echo "Error: Unable to determine app URL"
  exit 1
fi

# Set the environment variables.
# These ones are varying from environment to environment.
export NEXT_PUBLIC_APP_URL="$app_url"
export NEXT_PUBLIC_DPL_CMS_HOSTNAME="${LAGOON_DOMAIN}"
export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="${LAGOON_ROUTE}/graphql"

# Go to the app directory if it doesn't exist then never mind.
cd /app || exit 1

yarn build && yarn start
exit 0
