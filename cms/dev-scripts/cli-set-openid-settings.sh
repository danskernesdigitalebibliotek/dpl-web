#!/usr/bin/env bash

# shellcheck source=/dev/null
set -aeo pipefail; source .env; set +a

# Check if all environment variables are defined
if [[ -z $OPENID_CLIENT_ID ]]; then
  echo "Error: OPENID_CLIENT_ID is missing!"
  exit 1
fi
if [[ -z $OPENID_CLIENT_SECRET ]]; then
  echo "Error: OPENID_CLIENT_SECRET is missing!"
  exit 1
fi
if [[ -z $OPENID_AGENCY_ID ]]; then
  echo "Error: OPENID_AGENCY_ID is missing!"
  exit 1
fi


# Define the mapping of environment variables to keys
declare -A mapping=(
  ["OPENID_CLIENT_ID"]="client_id"
  ["OPENID_CLIENT_SECRET"]="client_secret"
  ["OPENID_AGENCY_ID"]="agency_id"
)

# Iterate over the mapping and execute the command
for key in "${!mapping[@]}"; do
  value="${mapping[$key]}"
  command="drush cset -y openid_connect.settings.adgangsplatformen settings.$value ${!key}"
  eval "$command"
done
