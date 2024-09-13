#!/bin/bash

# This error handler is used in .lagoon.yml, for catching errors and passing
# along the failing details to the GH deployment.

error_handler() {
  DEPLOYMENT_STATUS="failure"
  GH_DEPLOYMENT_ID=$(cat /tmp/gh_deployment_id)
  echo "Setting GH deployment status '$GH_DEPLOYMENT_ID': '$DEPLOYMENT_STATUS'"

  curl -L \
    -X POST \
    -H "Authorization: Bearer $GH_DEPLOYMENT_TOKEN" \
    https://api.github.com/repos/danskernesdigitalebibliotek/dpl-cms/deployments/"$GH_DEPLOYMENT_ID"/statuses \
    -d "{\"environment\":\"$LAGOON_PR_HEAD_BRANCH\",\"state\":\"$DEPLOYMENT_STATUS\"}"

  # As we've gotten rid of set -e in lagoon.yml, it is very important to exit
  # here, otherwise, lagoon will think a faulty deploy has succeeded.
  exit "$1"
}

# Set up trap for ERR signal
trap 'error_handler $?' ERR
