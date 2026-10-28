#!/usr/bin/env bash
# Watch a Lagoon deployment until it finishes.
#
# Prints one line per state change (status or build step) and exits when the
# deployment reaches a terminal state: 0 on complete, 1 on failed/cancelled/error.
# Mirrors the latest line to $XDG_CACHE_HOME/lagoon-deploy-watch/<project>__<env> for
# the status line (see statusline.sh).
#
# Usage: watch.sh [-p project] [-e environment] [-d deployment-name] [-i seconds]
# Defaults: environment from the current branch (pr-<N> if it has a PR, else the
# branch name), project from the Lagoon projects whose git URL matches origin,
# deployment = the one built for HEAD (see run_state in lib.sh; needs an
# authenticated gh).

set -u
# shellcheck source-path=SCRIPTDIR source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

# The GitHub workflow and job that send Lagoon HEAD's deploy event.
workflow=lagoon-deploy.yml deploy_job="Lagoon / Send deploy event to Lagoon"

interval=30 project="" env="" deployment=""
while getopts p:e:d:i: o; do
  case $o in
    p) project=$OPTARG ;; e) env=$OPTARG ;; d) deployment=$OPTARG ;; i) interval=$OPTARG ;;
    *) echo "usage: $0 [-p project] [-e env] [-d deployment] [-i seconds]" >&2; exit 2 ;;
  esac
done

check_prerequisites
[ -n "$env" ] || resolve_env
[ -n "$project" ] || resolve_project

mkdir -p "$state_dir"
state_file="$state_dir/${project}__${env}"

[ -n "$deployment" ] || wait_for_deployment

estimate_duration
if [ -n "$estimate" ]; then
  echo "$project/$env: watching $deployment, estimate ~$(round_minutes "$estimate")m (average of $samples previous deploys of $basis)"
else
  echo "$project/$env: watching $deployment, no previous successful deploys to estimate from"
fi

watch_deployment
