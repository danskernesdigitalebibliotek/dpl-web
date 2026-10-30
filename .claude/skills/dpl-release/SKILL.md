---
name: dpl-release
description: "Guide a regular dpl-web release to staging end-to-end: release PR develop→main, back-merge of hotfixes from main, CI monitoring (known flaky jobs), GitHub release + tag YYYY.WW.X, staging/bnf bump in dpl-platform sites.yaml, dplsh deploy, announcement and Jira fix-version check, and afterwards the production PR (editors/webmasters/canary bump) once staging is approved. Use when the user asks to make a new release, release to staging or production, or follow the dpl-web release process."
argument-hint: "[<version>]"
---

# dpl-release — regular release of dpl-web to staging and production

Walk the user through a regular release and do the GitHub-side work for them.
Respond in the user's language.

The official process lives in the docs below. They win over this skill — read
them at the start of every run and point out any difference:

- dpl-docs: `docs/General/release-process.md`, `docs/General/hotfix-releases.md`
- dpl-platform: `docs/runbooks/how-release-a-new-version-for-approval-testing.md`
  (staging) and `docs/runbooks/weekly-release.md` (production, separate flow)

```sh
gh api repos/danskernesdigitalebibliotek/<repo>/contents/<path> -H 'Accept: application/vnd.github.raw'
```

## Ground rules

- Ask before anything outward-facing: creating PRs, pushing, commenting,
  changing Jira. Re-running failed CI jobs is fine.
- Leave pushing to the user unless they explicitly ask you to push.
- Treat Jira as read-only unless asked.
- Don't press or suggest "Update branch" on the release PR. That merges `main`
  into `develop` via GitHub. Use the back-merge PR in step 2 instead.
- Never read or write secrets (`.env`, tokens). Tell the user what's needed.
- Deployment commands (dplsh, Lagoon) are run by the user, not by you.

## 1. Pre-flight

```sh
git fetch origin main develop
gh release list --limit 5
date +%G.%V                                   # ISO year.week
git ls-remote --tags origin "refs/tags/$(date +%G.%V)*"
git log --oneline origin/develop..origin/main # hotfixes missing on develop
```

The version is `YYYY.WW.0` for the current ISO week. If a tag for that week
already exists, bump the last number.

A regular release does not create a branch. A `YYYY.WW.x` branch is only made
from the tag when the first hotfix for that version is needed (see
hotfix-releases.md).

## 2. Release PR + back-merge

- Release PR:
  `gh pr create --base main --head develop --title "Release <version>" --body ""`
- If `main` has commits that `develop` lacks (hotfixes), the release PR shows
  "out-of-date with the base branch". Check whether that actually blocks the
  merge (`gh pr view <pr> --json mergeStateStatus,reviewDecision`). Either way,
  bring the hotfixes back with a back-merge PR:
  `gh pr create --base develop --head main --title "Merge changes from main back into develop for release <version>" --body "<list the hotfixes>"`
  It must be merged with **"Create a merge commit"**. Squash or rebase leaves
  `main`'s commits missing from `develop`.
- Merging the back-merge restarts all CI on the release PR. Bot commits
  (e.g. translation sync) can also land on `develop` in the meantime.
- `main` requires an approving review. Suggest asking for one early.

## 3. Monitor CI

Run the checks in the background and poll them. `gh run watch` can exit
before the run is done, so don't rely on it.

```sh
gh pr checks <pr> --json name,state,bucket,link,description
gh run view <run-id> --json status,jobs --jq '.jobs[] | "\(.status)\t\(.conclusion)\t\(.name)"'
gh api --allow-escape-sequences /repos/danskernesdigitalebibliotek/dpl-web/actions/jobs/<job-id>/logs
```

Before calling a failure flaky, compare it with sibling jobs in the same run
and with the last green run on `develop`. Then re-run it:
`gh run rerun <run-id> --failed`. This only works once the whole run has
finished.

Flaky patterns seen so far (this list goes stale, so verify each time):

- **CMS Cypress shard fails in `dev:reset`** with
  `ConfigImportCommands.php … field storage does not exist`, or with
  `Could not acquire processing lock`. The log shows `create field.storage…`
  succeeding, and the other shards import the same config without problems.
  If the fields involved are new config in this release, still flag it: every
  site runs that same import on upgrade, so watch `drush deploy` on staging.
- **Go E2E spec timing out** while waiting for content to render, when Go CI
  was green on the previous `develop` commit and the new commits can't affect
  it.
- **`argos/go` or `argos/design-system` failing with changes awaiting
  review**. A human has to review them in Argos.

Report to the user when every check is green or only needs human action.

## 4. GitHub release

The user does this in the GitHub UI, after merging the release PR with a merge
commit:

1. Releases → Draft a new release → Select tag → Create new tag `<version>`.
2. Set the target to `main`.
3. Click "Generate release notes".
4. Make sure "Set as the latest release" is selected, then publish.

Then watch the builds for the tag:

```sh
gh run list --branch <version> --json name,status,conclusion
```

The build takes roughly 10 minutes. Don't deploy until it has succeeded and
the image exists.

## 5. dpl-platform staging PR

Branch off `origin/main` in a local checkout of `dpl-platform`, named
`release/<version>-staging`. Use `git checkout --no-track -b <branch> origin/main`;
without `--no-track` the branch tracks `origin/main` and `git status` shows
"ahead of origin/main", which looks as if it were pushed. In
`infrastructure/environments/dplplat01/sites.yaml`, bump what the
approval-testing runbook lists. Currently that is:

- `staging`: `dpl-cms-release`, `moduletest-dpl-cms-release`, `go-release`
- `bnf`: `moduletest-dpl-cms-release`

Leave the canary sites alone unless the user says otherwise. Keep the change
in one commit. Model the PR on the previous staging PR:

```sh
gh pr list -R danskernesdigitalebibliotek/dpl-platform --state all --search "staging in:title" --limit 3
```

## 6. Deploy with dplsh

The user runs this. Help them with setup problems. These prerequisites are not
all in the runbook:

- **bash 4 or newer.** macOS ships bash 3.2, which fails on `declare -A`.
- **The dplsh image, pulled once** with `tools/dplsh/dplsh.sh --update`.
  Without it you get `No such object: …/dplsh:latest`. On Apple silicon, an
  amd64/arm64 platform warning is expected.
- **A `GITHUB_TOKEN` with push access** to the site environment repos.
  `site:sync` clones and pushes them. Set it in dplsh or in
  `infrastructure/.env`. Without it, git falls back to the host's credential
  helper, which doesn't exist inside the container, and fails with
  "Authentication failed".
- **The Lagoon CLI configured for the platform.** `site:sync` depends on
  `lagoon:cli:check`; fix with `task lagoon:cli:config`, after loading the ssh
  key into an agent.
- **`task cluster:auth` is not needed** for `site:sync`.

```sh
cd <dpl-platform>/infrastructure && ../tools/dplsh/dplsh.sh
SITE=staging task site:sync
SITE=bnf task site:sync
```

If the sync shows Terraform changes beyond the version bump, stop and involve
the platform team. Otherwise follow the deployments in Lagoon UI and use
`troubleshoot-release-deployment.md` when one fails.

## 7. Announce + Jira

Announce as release-process.md describes: a new topic named `<version>`, with
links to staging and to
`https://github.com/danskernesdigitalebibliotek/dpl-web/releases/tag/<version>`.
Offer a draft.

Jira check (read-only, e.g. with `acli`):

```sh
acli jira workitem search --jql 'project = DDF AND fixVersion = "UPCOMING" ORDER BY status' --fields "key,summary,status" --limit 200 --csv
git log --format='%s %b' <previous-tag>..origin/develop | grep -oiE 'ddf-?[0-9]+' | sort -u
acli jira workitem view <KEY> --fields "summary,status,fixVersions" --json
```

Report two kinds of tickets:
- tickets in `UPCOMING` that already shipped in a hotfix;
- tickets referenced in commits that have no fix version (open ones may be
  only partly done).

The user then renames `UPCOMING` to `<version>`, marks it released and creates
a new `UPCOMING`.

Production is a separate flow (`weekly-release.md`) and happens after the
release has been approved on staging. See step 8.

## 8. dpl-platform production PR

When the release is approved on staging, make the production PR and hand it
over to the hosting provider. They review, merge and deploy; the deploy steps
in `weekly-release.md` are theirs, not ours.

```sh
gh run list -R danskernesdigitalebibliotek/dpl-web --branch <version> --json name,status,conclusion
gh pr list -R danskernesdigitalebibliotek/dpl-platform --state merged --search "editors in:title" --limit 3
```

The tag build must be green. Branch `release/<version>-production` off
`origin/main` (`--no-track`, see step 5) and bump in `sites.yaml`:

- `x-defaults`: `dpl-cms-release` and `go-release` → latest.
- `x-webmasters-on-weekly-release-cycle`: `dpl-cms-release` and `go-release`
  → the version `x-defaults` had before (incl. hotfix bumps, e.g. `2026.38.4`);
  `moduletest-dpl-cms-release` → latest.
- `cms-school`: `moduletest-dpl-cms-release` → latest.
- `canary` and `customizable-canary`: all three release keys → latest, even
  if canary is on a `-test.N` pre-release.

`staging`, `bnf` and `bibliotek-test` need no edits. Commit and PR title:
`Release YYYY.WW to editors, YYYY.WW-2 to webmasters`; body lists each bump
and links to the dpl-web release. Then the user pushes, and the PR goes to
the hosting provider.
