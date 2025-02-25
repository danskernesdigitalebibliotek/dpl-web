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

# Make sure the DPL CMS graphql schema endpoint is set in application
goCmsUrlPrefix="nginx."
# If the project is "dpl-cms", we are running in a PR environment
# and then the goUrlPrefix should be cms-.
# Otherwise we are in production and the goUrlPrefix should be "nginx.".
if [ "$LAGOON_PROJECT" = "dpl-cms" ]; then
  goCmsUrlPrefix="cms-"
fi
cms_url=$(getLagoonUrl $goCmsUrlPrefix)
if [ -z "$cms_url" ]; then
  echo "Error: Unable to determine CMS URL"
  exit 1
fi

removeProtocol() {
  local url=$1

  echo "$url" | sed -e 's/https\?:\/\///'
}

# Set the environment variables.
# These ones are varying from environment to environment.
export NEXT_PUBLIC_APP_URL="$app_url"
export NEXT_PUBLIC_DPL_CMS_HOSTNAME=removeProtocol($cms_url)
export NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="$cms_url/graphql"

# Go to the app directory if it doesn't exist then never mind.
cd /app || exit 1

yarn build && yarn start
exit 0
