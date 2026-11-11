#!/usr/bin/env bash
#
# Print a digest of dpl-web's open pull requests: one list of non-draft PRs by
# people with who has to act next, one list of Dependabot PRs. The rules for
# who acts next live in open-pull-requests-digest.jq.
#
# Usage: open-pull-requests-digest.sh [--format zulip|terminal]
#
# The default, zulip, is the markdown posted by
# .github/workflows/open-pull-requests-digest.yml. Runs locally too from
# anywhere inside the repository (needs gh and jq).

set -euo pipefail

usage="Usage: $0 [--format zulip|terminal]"

case "${1:-}" in
  "") format=zulip ;;
  --format) format=${2:-} ;;
  *) echo "$usage" >&2; exit 1 ;;
esac

if [[ "$format" != zulip && "$format" != terminal ]]; then
  echo "$usage" >&2
  exit 1
fi

script_directory=$(dirname "${BASH_SOURCE[0]}")

pull_requests=$(gh pr list --state open --limit 300 \
  --json number,title,url,author,isDraft,assignees,reviewRequests,reviews,latestReviews,reviewDecision)

# Extra arguments are passed on to jq, e.g. --arg.
digest_jq() {
  local filter=$1 input=$2
  shift 2
  jq -r -L "$script_directory" "$@" "include \"open-pull-requests-digest\"; $filter" <<<"$input"
}

human_pull_requests=$(digest_jq '[.[] | select(.author.is_bot != true and .isDraft == false)] | sort_by(review_status.rank, .number)' "$pull_requests")
dependabot_pull_requests=$(jq '[.[] | select(.author.login == "app/dependabot")] | sort_by(.number)' <<<"$pull_requests")

print_zulip() {
  echo "**Open PRs on dpl-web** ($(jq length <<<"$human_pull_requests"))"
  echo
  echo "| Status | PR | Author | Next action |"
  echo "| :---: | --- | --- | --- |"
  digest_jq '.[] | "| \(review_status.emoji) | [\(safe_title | escape_table_cell)](\(.url)) | \(.author.login) | \(format_next_actions("**\(.)**")) |"' "$human_pull_requests"
  echo
  echo "**Open Dependabot PRs** ($(jq length <<<"$dependabot_pull_requests"))"
  echo
  digest_jq '.[] | "- [#\(.number) \(safe_title)](\(.url))"' "$dependabot_pull_requests"
}

# $bold, $dim and $reset in the jq filters are jq variables, not shell ones.
# shellcheck disable=SC2016
print_terminal() {
  local bold="" dim="" reset=""
  if [[ -t 1 && -z "${NO_COLOR:-}" ]]; then
    bold=$'\e[1m' dim=$'\e[2m' reset=$'\e[0m'
  fi
  local styles=(--arg bold "$bold" --arg dim "$dim" --arg reset "$reset")

  echo "${bold}Open PRs on dpl-web${reset} ($(jq length <<<"$human_pull_requests"))"
  echo
  digest_jq '.[] | "\(review_status.emoji) #\(.number) \(.title)\n   \($dim)by\($reset) \(.author.login) \($dim)·\($reset) \(format_next_actions("\($bold)\(.)\($reset)"))\n   \($dim)\(.url)\($reset)\n"' "$human_pull_requests" "${styles[@]}"
  echo "${bold}Open Dependabot PRs${reset} ($(jq length <<<"$dependabot_pull_requests"))"
  echo
  digest_jq '.[] | "#\(.number) \(.title) \($dim)\(.url)\($reset)"' "$dependabot_pull_requests" "${styles[@]}"
}

"print_$format"
