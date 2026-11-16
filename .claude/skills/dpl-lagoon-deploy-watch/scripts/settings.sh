#!/usr/bin/env bash
# Reads and stores the developer's status line choice in the checkout's
# .claude/settings.local.json under dplLagoonDeployWatch.useStatusLine.
#
#   settings.sh get          prints true, false, unset, missing (true, but
#                            no statusLine in either settings file) or stale
#                            (false, but settings.local.json's statusLine
#                            still runs statusline.sh)
#   settings.sh set true     stores true and points statusLine at statusline.sh
#   settings.sh set false    stores false and removes that statusLine again
#
# `set true` leaves a statusLine that runs some other command alone (it would
# replace the developer's own) and says so instead.
set -euo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
statusline="$script_dir/statusline.sh"
root=$(git -C "$script_dir" rev-parse --show-toplevel)
local_file="$root/.claude/settings.local.json"
user_file="$HOME/.claude/settings.json"

command -v jq >/dev/null || { echo "ERROR: jq is missing; install it first"; exit 2; }

# Prints the statusLine command configured in <file>, if any.
statusline_in() { if [ -f "$1" ]; then jq -r '.statusLine.command // empty' "$1"; fi; }
ours() { [[ $1 == */dpl-lagoon-deploy-watch/scripts/statusline.sh ]]; }

# update <jq program> [jq args…]: rewrites settings.local.json in place.
update() {
  local program=$1 tmp
  shift
  [ -f "$local_file" ] || echo '{}' >"$local_file"
  tmp=$(mktemp)
  jq "$@" "$program" "$local_file" >"$tmp" && mv "$tmp" "$local_file"
}

case "${1:-} ${2:-}" in
  "get ")
    [ -f "$local_file" ] || { echo unset; exit 0; }
    value=$(jq -r '.dplLagoonDeployWatch.useStatusLine | if . == null then "unset" else tostring end' "$local_file")
    if [ "$value" = true ] && [ -z "$(statusline_in "$local_file")" ] && [ -z "$(statusline_in "$user_file")" ]; then
      value=missing
    elif [ "$value" = false ] && ours "$(statusline_in "$local_file")"; then
      value=stale
    fi
    echo "$value" ;;
  "set true")
    update '.dplLagoonDeployWatch.useStatusLine = true'
    local_cmd=$(statusline_in "$local_file")
    user_cmd=$(statusline_in "$user_file")
    if [ -n "$local_cmd" ] && ! ours "$local_cmd"; then
      echo "Saved. Not enabled: $local_file already has a statusLine ($local_cmd)."
    elif [ -n "$local_cmd" ] || { [ -n "$user_cmd" ] && ours "$user_cmd"; }; then
      echo "Saved. The status line was already set up."
    elif [ -n "$user_cmd" ]; then
      echo "Saved. Not enabled: $user_file already has a statusLine ($user_cmd)."
    else
      # shellcheck disable=SC2016 # $cmd is a jq variable
      update '.statusLine = {type: "command", command: $cmd}' --arg cmd "$statusline"
      echo "Saved. Status line enabled; restart Claude Code to see it."
    fi ;;
  "set false")
    update '.dplLagoonDeployWatch.useStatusLine = false'
    if ours "$(statusline_in "$local_file")"; then
      update 'del(.statusLine)'
      echo "Saved. Status line removed; restart Claude Code to clear it."
    else
      echo "Saved."
    fi ;;
  *)
    echo "usage: settings.sh get | set true|false" >&2
    exit 2 ;;
esac
