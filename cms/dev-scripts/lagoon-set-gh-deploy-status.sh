#!/bin/bash

# Ensure the required arguments are passed
if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "Usage: $0 <state> [optional_environment_url]"
  exit 1
fi

# Assign the state passed as an argument
STATE=$1
DRUPAL_URL=${2:-""}

GH_DEPLOYMENT_ID=$(cat /tmp/GH_DEPLOYMENT_ID)
LAGOON_DEPLOYS_LOG_URL=$(cat /tmp/LAGOON_DEPLOYS_LOG_URL)
ENVIRONMENT=$LAGOON_ENVIRONMENT

# We want BNF to show up as a separate environment.
if [[ "$LAGOON_PROJECT" == "dpl-bnf" ]]; then
  ENVIRONMENT=$LAGOON_ENVIRONMENT-bnf
fi

echo "Setting GH deployment status '$GH_DEPLOYMENT_ID': '$STATE'"

# GitHub API request to update deployment status
curl -L -X POST -H "Authorization: Bearer $GH_DEPLOYMENT_TOKEN" \
  "https://api.github.com/repos/danskernesdigitalebibliotek/dpl-cms/deployments/$GH_DEPLOYMENT_ID/statuses" \
  -d "{\"environment\":\"$ENVIRONMENT\",\"state\":\"$STATE\", \
        \"environment_url\":\"$DRUPAL_URL\", \"log_url\":\"$LAGOON_DEPLOYS_LOG_URL\"}"
