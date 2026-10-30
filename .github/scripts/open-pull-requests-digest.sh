#!/usr/bin/env bash
#
# Print a Zulip markdown digest of dpl-web's open pull requests: one list of
# non-draft PRs by people with who has to act next, one list of Dependabot
# PRs. The rules for who acts next live in open-pull-requests-digest.jq.
#
# Used by .github/workflows/open-pull-requests-digest.yml, but runs locally
# too from anywhere inside the repository (needs gh and jq).

set -euo pipefail

script_directory=$(dirname "${BASH_SOURCE[0]}")

pull_requests=$(gh pr list --state open --limit 300 \
  --json number,title,url,author,isDraft,assignees,reviewRequests,reviews,latestReviews,reviewDecision)

digest_jq() {
  jq -r -L "$script_directory" "include \"open-pull-requests-digest\"; $1" <<<"$2"
}

human_pull_requests=$(digest_jq '[.[] | select(.author.is_bot != true and .isDraft == false)] | sort_by(review_status.rank, .number)' "$pull_requests")
dependabot_pull_requests=$(jq '[.[] | select(.author.login == "app/dependabot")] | sort_by(.number)' <<<"$pull_requests")

echo "**Open PRs on dpl-web** ($(jq length <<<"$human_pull_requests"))"
echo
digest_jq '.[] | "- \(review_status.emoji) [#\(.number) \(safe_title)](\(.url))\(format_next_actions)"' "$human_pull_requests"
echo
echo "**Open Dependabot PRs** ($(jq length <<<"$dependabot_pull_requests"))"
echo
digest_jq '.[] | "- [#\(.number) \(safe_title)](\(.url))"' "$dependabot_pull_requests"
