#!/usr/bin/env bash
#
# Print a Zulip markdown digest of dpl-web's open pull requests: one list of
# non-draft PRs by people, one list of Dependabot PRs.
#
# Used by .github/workflows/open-pull-requests-digest.yml, but runs locally
# too from anywhere inside the repository (needs gh and jq).

set -euo pipefail

pull_requests=$(gh pr list --state open --limit 300 \
  --json number,title,url,author,isDraft)

# Anyone can open a PR on a public repository, so a title could contain Zulip
# mentions (@**name**, @*group*). Make them silent so they don't notify
# anyone; Zulip applies the same rewrite to mentions inside block quotes.
jq_helpers='def safe_title: .title | gsub("@(?=\\*)"; "@_");'

human_pull_requests=$(jq '[.[] | select(.author.is_bot != true and .isDraft == false)] | sort_by(.number)' <<<"$pull_requests")
dependabot_pull_requests=$(jq '[.[] | select(.author.login == "app/dependabot")] | sort_by(.number)' <<<"$pull_requests")

echo "**Open PRs on dpl-web** ($(jq length <<<"$human_pull_requests"), excluding Dependabot and drafts)"
echo
jq -r "$jq_helpers"' .[] | "- [#\(.number) \(safe_title)](\(.url)) — @\(.author.login)"' <<<"$human_pull_requests"
echo
echo "**Open Dependabot PRs** ($(jq length <<<"$dependabot_pull_requests"))"
echo
jq -r "$jq_helpers"' .[] | "- [#\(.number) \(safe_title)](\(.url))"' <<<"$dependabot_pull_requests"
