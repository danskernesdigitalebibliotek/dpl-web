# Helpers for open-pull-requests-digest.sh. Each takes one PR from
# `gh pr list --json` as input.

# Anyone can open a PR on a public repository, so a title could contain Zulip
# mentions (@**name**, @*group*). Make them silent so they don't notify
# anyone; Zulip applies the same rewrite to mentions inside block quotes.
def safe_title: .title | gsub("@(?=\\*)"; "@_");

# Who has to act next, following the team's review flow: assignees are a pool
# of review candidates, and whoever picks a PR up assigns themselves as
# reviewer and leaves the pool. Returns a list of {who, action}.
def next_actions:
  .author.login as $author
  | [.reviewRequests[] | .login // .name] as $requested
  # Authors' replies to review comments are reviews too, so leave them out.
  | [.reviews[].author.login | select(. != $author)] as $reviewed
  # GitHub leaves re-requested reviewers out of latestReviews, so these are
  # the verdicts nobody has been asked to revisit yet.
  | [.latestReviews[] | select(.author.login != $author)] as $settled_reviews
  # Candidates stay in the pool after others have reviewed, since the author
  # may still want their input. Those who already reviewed are not counted.
  | [.assignees[].login | select(IN($requested[], $reviewed[]) | not)] as $candidates
  | [
      ($requested | map(select(IN($reviewed[]) | not)) + $candidates
        | select(length > 0) | {who: ., action: "review"}),
      ($requested | map(select(IN($reviewed[])))
        | select(length > 0) | {who: ., action: "re-review"}),
      (if any($settled_reviews[]; .state == "CHANGES_REQUESTED") then
         {who: [$author], action: "address changes"}
       elif .reviewDecision == "APPROVED" then
         {who: [$author], action: "approved"}
       elif ($requested | length) == 0 and ($reviewed | length) > 0 then
         {who: [$author], action: "follow up on review"}
       else empty end),
      (if ($requested + $reviewed + [.assignees[].login] | length) == 0 then
         {who: [$author], action: "assign review candidates"}
       else empty end)
    ];

# GitHub's overall review decision: the emoji leading the line, and the order
# PRs are listed in.
def review_status:
  {"APPROVED": {emoji: "✅", rank: 0}, "CHANGES_REQUESTED": {emoji: "⛔", rank: 1}}[.reviewDecision]
    // {emoji: "🟡", rank: 2};

# "who (action) · …". Every PR gets at least one action.
def format_next_actions:
  next_actions | map("\(.who | map("**\(.)**") | join(", ")) (\(.action))") | join(" · ");

# A pipe in a title would end its table cell early.
def escape_table_cell: gsub("\\|"; "\\|");
