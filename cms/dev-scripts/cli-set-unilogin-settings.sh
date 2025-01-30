#!/usr/bin/env bash

# shellcheck source=/dev/null
set -aeo pipefail; source .env; set +a

# Check if all environment variables are defined
if [[ -z $UNILOGIN_CLIENT_ID ]]; then
  echo "Error: UNILOGIN_CLIENT_ID is missing!"
  exit 1
fi
if [[ -z $UNILOGIN_CLIENT_SECRET ]]; then
  echo "Error: UNILOGIN_CLIENT_SECRET is missing!"
  exit 1
fi

# Define the mapping of environment variables to keys
declare -A mapping=(
  ["UNILOGIN_CLIENT_ID"]="unilogin_api_client_id"
  ["OPENID_CLIENT_SECRET"]="unilogin_api_client_secret"
)

# Iterate over the mapping and execute the command
for key in "${!mapping[@]}"; do
  value="${mapping[$key]}"
  command="drush cset -y dpl_unilogin.settings $value ${!key}"
  eval "$command"
done
