#!/usr/bin/env bash

# shellcheck source=/dev/null
set -aeo pipefail; source .env; set +a

# Check if all environment variables are defined
if [[ -z $UNILOGIN_CLIENT_SECRET ]]; then
  echo "Error: UNILOGIN_CLIENT_SECRET is missing!"
  exit 1
fi
if [[ -z $UNILOGIN_WEBSERVICE_USERNAME ]]; then
  echo "Error: UNILOGIN_WEBSERVICE_USERNAME is missing!"
  exit 1
fi
if [[ -z $UNILOGIN_WEBSERVICE_PASSWORD ]]; then
  echo "Error: UNILOGIN_WEBSERVICE_PASSWORD is missing!"
  exit 1
fi
if [[ -z $UNILOGIN_PUBHUB_RETAILER_KEY_CODE ]]; then
  echo "Error: UNILOGIN_PUBHUB_RETAILER_KEY_CODE is missing!"
  exit 1
fi
if [[ -z $UNILOGIN_MUNICIPALITY_ID ]]; then
  echo "Error: UNILOGIN_MUNICIPALITY_ID is missing!"
  exit 1
fi

# Define the mapping of environment variables to keys
declare -A mapping=(
  ["UNILOGIN_CLIENT_SECRET"]="unilogin_api_client_secret"
  ["UNILOGIN_WEBSERVICE_USERNAME"]="unilogin_api_webservice_username"
  ["UNILOGIN_WEBSERVICE_PASSWORD"]="unilogin_api_webservice_password"
  ["UNILOGIN_PUBHUB_RETAILER_KEY_CODE"]="unilogin_api_pubhub_retailer_key_code"
  ["UNILOGIN_MUNICIPALITY_ID"]="unilogin_api_municipality_id"
)

# Iterate over the mapping and execute the command
for key in "${!mapping[@]}"; do
  value="${mapping[$key]}"
  command="drush cset -y dpl_unilogin.settings $value ${!key}"
  eval "$command"
done
