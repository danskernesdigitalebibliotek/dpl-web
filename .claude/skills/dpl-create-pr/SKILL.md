---
name: dpl-create-pr
description: "Create the GitHub pull request for the current dpl-web branch, or update the title and description of one that already exists, following dpl-web conventions — ticket key in the title, and the sections of .github/PULL_REQUEST_TEMPLATE.md filled in English, grounded in the actual diff, with environment links built from the PR number. Does NOT touch code, commits or pushes. Use when the user says 'lav en PR', 'opret PR', 'create a PR', 'renskriv PR', 'omskriv PR', 'clean up the PR', or 'rewrite the PR title/description'."
argument-hint: "[<pr-number> | <pr-url>]"
---

# dpl-create-pr — create or update a pull request

Write a pull request's **title** and **description** so they match the team's
conventions, grounded in what the PR actually changes. If the branch has no PR
yet, create it (`gh pr create`); otherwise edit the existing one
(`gh pr edit`). Either way this touches only PR metadata on GitHub — never
code, commits, or branches.

Respond to the user in their language, but the PR title and description you
produce are always **English**.

## Rules

**Title**
- Start with the Jira ticket key, then a concise English summary of the change:
  `DDF-410: Sort same-year editions by edition number`.
- Derive the ticket key primarily from the **branch name**: the leading
  `<PROJECT>-<NUMBER>` token, optionally after a `prefix/`, matched
  case-insensitively and upper-cased —
  `^(?:.*/)?([A-Za-z]+-[0-9]+)-?(.*)$`, e.g.
  `DDF-410-edition-number-sort-tiebreaker` → `DDF-410` and
  `kb/ddf-410-...` → `DDF-410`. Fall back to the existing PR title or the
  "Link to issue" body if the branch has no such token. **Never invent one.** If no
  key can be found anywhere, write the title without a key and tell the user so
  they can add it.
- Describe the change, not the file. Imperative, first letter upper-case after
  the colon, no trailing period. Keep it short.

**Body** — the repo's PR template, `.github/PULL_REQUEST_TEMPLATE.md`, is the
source of truth for *which* sections the body has and what goes in each. Read
it, keep its headings in its order, fill each one by the guidance in its HTML
comment, and strip the comments from the output. The rules below are about
*how* to fill them:

- **URLs from the PR number.** Substitute the real PR number for `<N>` in every
  environment URL the template gives (e.g. PR 1187 → `varnish.pr-1187…`,
  `node.pr-1187…` and `…dpl-web-pr-1187`). List both the CMS and the GO URL,
  even when the PR only touches one of them. If the sections already hold the
  correct URLs, keep them as-is. Never leave a `<N>` or `{clipboard}`-style
  placeholder in the output.
- **Link to issue** — `https://reload.atlassian.net/browse/<KEY>` from the
  ticket key derived above. Add or fix it if missing/wrong.
- **Description** — the template's Problem/Fix structure, within its sentence
  limits. In **Fix**, if the change funnels through one shared place, say so.
  Add a one-line **Tests** only if the diff actually adds/changes tests, naming
  what is now covered, not a list of the test files or cases.
- **Screenshots / videos** — you cannot capture these. If the change is visible
  (styling, a user flow), keep the heading with `_TODO: add before/after
  screenshots_` (or a video for a flow) and tell the user; otherwise remove the
  section.
- **How to test** — the environment URLs, then numbered steps a tester can
  follow **in the browser alone** (testers have no Lagoon, ssh or drush
  access). Use **full, clickable URLs, not bare identifiers**, on the PR's own
  environment — `node` for a GO change, `varnish` for everything else. A
  specific work lives at the `/work/` path, so append the work id to it — e.g.
  `https://varnish.pr-<N>.dpl-web.dplplat02.dpl.reload.dk/work/work-of:870970-basis:22252852`,
  not just `work-of:870970-basis:22252852`. Reuse the ticket's "How to test"
  field or example when there is one.
- **Notes for reviewers** — only something a reviewer genuinely needs before
  reading the diff (a deliberate trade-off, a part to look at closely). Remove
  the section otherwise.
- Keep any other section already present in an existing PR untouched.
- **Keep it short — this is the hard rule.** Description, How-to-test steps and
  Notes together stay **under ~200 words**; most PRs need well under that. A
  reviewer reads the body to know where to look, then reads the diff. Write for
  that, and err on the short side — a body that is too brief costs a question,
  one that is too long does not get read.
  - Cut anything the diff already says: file lists, function and type names,
    signatures, cache values, restated code comments, and rationale that lives
    in a commit message or a code comment.
  - No API walkthroughs, no design defence, no history of how the change came
    about. If a decision genuinely needs defending, one sentence and a pointer
    to where it is documented.
  - Only mention a gap the **ticket itself asked for** and this PR does not
    deliver, and then in one sentence. A case the ticket never raised is not a
    gap - describing it invents scope and makes the PR look unfinished. If the
    code makes a deliberate choice there, the code comment is where it belongs.
- **Ground every claim in the real diff.** Read the changes before writing — do
  not describe tests, behaviour, or verification steps that are not in the PR.

## Workflow

1. **Resolve the PR.** Use the `<pr-number>`/`<pr-url>` argument if given;
   otherwise infer from the current branch:

   ```bash
   gh pr view --json number,title,body,headRefName,url
   ```

   If the branch has no PR, you are creating one. The branch must already be
   on `origin` with the local commits (`git ls-remote --heads origin <branch>`,
   compare with `git rev-parse HEAD`). If it isn't, stop and ask the user to
   push — never push yourself.

2. **Gather ground truth.** For an existing PR `<N>`:

   ```bash
   gh pr view <N> --json title,body,headRefName,commits
   gh pr diff <N>
   ```

   For a new PR, against the base branch (`develop` unless the user names
   another, e.g. a `YYYY.WW.x` release branch for a hotfix):

   ```bash
   git log --format='%s%n%b' origin/develop..HEAD
   git diff origin/develop...HEAD
   ```

   Extract the ticket key from the branch name with the regex above, e.g.
   `sed -nE 's#^(.*/)?([A-Za-z]+-[0-9]+).*#\2#p' | tr '[:lower:]' '[:upper:]'`
   (`ddf-410-edition-number-sort-tiebreaker` → `DDF-410`) — falling back to the
   existing title/body. If `acli` is authenticated, read the ticket for extra
   context (optional): `acli jira workitem view <KEY>`.

   Read `.github/PULL_REQUEST_TEMPLATE.md` for the sections to fill.

3. **Draft** the new title and body per the rules above: the template's sections
   in order, the issue link from the ticket key and the environment URLs from
   the PR number `<N>` (reuse existing URLs if already correct).

4. **Apply.** Write the body to a file. Edit an existing PR:

   ```bash
   gh pr edit <N> --title "<KEY>: <summary>" --body-file <file>
   ```

   A new PR has no number until it exists, so create it without the
   environment URLs, then add them from the returned number with
   `gh pr edit <N> --body-file <file>`:

   ```bash
   gh pr create --draft --base develop --head <branch> --title "<KEY>: <summary>" --body-file <file>
   ```

5. **Report** the PR URL and the title. For an existing PR, say what was
   preserved vs rewritten. If no ticket key was found, flag it.

## Notes

- Scope is title + description only. Do not push, amend commits, or change code —
  if the diff itself needs work, that is a separate task.
- To change which sections a PR has, change `.github/PULL_REQUEST_TEMPLATE.md`,
  not this skill — the template serves both people and agents.
- Keeping ticket keys in code or commit messages is wrong (the repo is open
  source); the ticket number belongs in the PR title and the Jira link. This
  skill only edits PR metadata, so it never introduces keys into the codebase.
