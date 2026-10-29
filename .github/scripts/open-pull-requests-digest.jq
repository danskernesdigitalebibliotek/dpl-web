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
  | [
      ($requested | map(select(IN($reviewed[]) | not))
        | select(length > 0) | {who: ., action: "review"}),
      ($requested | map(select(IN($reviewed[])))
        | select(length > 0) | {who: ., action: "re-review"}),
      (if any($settled_reviews[]; .state == "CHANGES_REQUESTED") then
         {who: [$author], action: "address changes"}
       elif .reviewDecision == "APPROVED" then
         {who: [$author], action: "merge"}
       elif ($requested | length) == 0 and ($reviewed | length) > 0 then
         {who: [$author], action: "follow up on review"}
       else empty end),
      (if ($requested | length) == 0 and ($reviewed | length) == 0 then
         if (.assignees | length) > 0 then
           {who: [.assignees[].login], action: "pick up review"}
         else
           {who: [$author], action: "assign review candidates"}
         end
       else empty end)
    ];

def format_next_actions:
  next_actions | map("\(.who | join(", ")) (\(.action))") | join(" · ");
