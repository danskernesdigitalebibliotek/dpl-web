#!/bin/bash

# This error handler is used in .lagoon.yml, for catching errors and passing
# along the failing details to the GH deployment.

error_handler() {
  ./dev-scripts/lagoon-set-gh-deploy-status.sh "failure"

  # As we've gotten rid of set -e in lagoon.yml, it is very important to exit
  # here, otherwise, lagoon will think a faulty deploy has succeeded.
  exit "$1"
}

# Set up trap for ERR signal
trap 'error_handler $?' ERR
