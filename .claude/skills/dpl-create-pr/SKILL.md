---
name: dpl-create-pr
description: "Create the GitHub pull request for the current dpl-web branch, or update the title and description of one that already exists, following dpl-web conventions — ticket key in the title, Jira link in the body, Test and Dev-links sections built from the PR number, and a clear English Problem/Fix/Tests/How-to-verify description grounded in the actual diff. Does NOT touch code, commits or pushes. Use when the user says 'lav en PR', 'opret PR', 'create a PR', 'renskriv PR', 'omskriv PR', 'clean up the PR', or 'rewrite the PR title/description'."
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
  `DDF-410: sort same-year editions by edition number`.
- Derive the ticket key primarily from the **branch name**: take the first
  `<PROJECT>-<NUMBER>` token (regex `[A-Z]+-[0-9]+`, normally the leading prefix),
  e.g. `DDF-410-edition-number-sort-tiebreaker` → `DDF-410` and
  `kb/DDF-410-...` → `DDF-410`. Fall back to the existing PR title or the
  "Link to issue" body if the branch has no such token. **Never invent one.** If no
  key can be found anywhere, write the title without a key and tell the user so
  they can add it.
- Describe the change, not the file. Imperative, lower-case after the colon, no
  trailing period. Keep it short.

**Body** — always include these sections, in this order:
- `#### Link to issue` — the full Jira URL built from the ticket key derived
  above: `https://reload.atlassian.net/browse/<KEY>` (e.g. `DDF-410` →
  `https://reload.atlassian.net/browse/DDF-410`). Add or fix it if missing/wrong.
- `#### Test` — the PR's environment URLs, built from the PR number `<N>`. The
  CMS is served through `varnish`, GO through `node`. Include both, even when
  the PR only touches one of them:

  ```
  - CMS: https://varnish.pr-<N>.dpl-web.dplplat02.dpl.reload.dk/
  - GO: https://node.pr-<N>.dpl-web.dplplat02.dpl.reload.dk/
  ```

- `#### Dev links` — the Lagoon URL, built from the PR number `<N>`:

  ```
  https://ui.lagoon.dplplat02.dpl.reload.dk/projects/dpl-web/dpl-web-pr-<N>
  ```

- `#### Description` — see below.

Substitute the real PR number for `<N>` in the Test and Dev-links URLs (e.g. PR
1187 → `varnish.pr-1187…`, `node.pr-1187…` and `…dpl-web-pr-1187`). If those sections already exist
with the correct URLs, keep them as-is; otherwise (re)build them from `<N>`. Never
leave a `{clipboard}`-style placeholder in the output.
- Write `#### Description` in English, structured with the subset of these that
  applies:
  - **Problem** — the user-visible symptom and the root cause. 1-3 sentences.
  - **Fix** — what changed and where; if the change funnels through one shared
    place, say so. 1-3 sentences, or up to 4 bullets for a change that really
    spans several areas.
  - **Tests** — only if the diff actually adds/changes tests. **One line**
    naming what is now covered, not a list of the test files or cases.
  - **How to verify** — numbered steps a reviewer can follow, using **full,
    clickable URLs, not bare identifiers**. Point at the PR's own test
    environment — the `node` URL for a GO change, `varnish` for everything
    else. A specific work lives at the `/work/` path, so append the work
    id to it — e.g.
    `https://varnish.pr-<N>.dpl-web.dplplat02.dpl.reload.dk/work/work-of:870970-basis:22252852`,
    not just `work-of:870970-basis:22252852`. Reuse the example from the ticket
    when there is one.
- **Keep it short — this is the hard rule.** The whole `#### Description` stays
  **under ~200 words**; most PRs need well under that. A reviewer reads the
  description to know where to look, then reads the diff. Write for that, and
  err on the short side — a description that is too brief costs a question, one
  that is too long does not get read.
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

   Extract the ticket key from the branch name — the first `[A-Z]+-[0-9]+` token,
   e.g. `grep -oE '[A-Z]+-[0-9]+' | head -1` (`DDF-410-edition-number-sort-tiebreaker`
   → `DDF-410`) — falling back to the existing title/body. If `acli` is
   authenticated, read the ticket for extra context (optional):
   `acli jira workitem view <KEY> --fields summary,description`.

3. **Draft** the new title and body per the rules above. Build the Link-to-issue,
   Test, and Dev-links sections from the ticket key and the PR number `<N>` (reuse
   existing URLs if already correct), then write the rewritten Description.

4. **Apply.** Write the body to a file. Edit an existing PR:

   ```bash
   gh pr edit <N> --title "<KEY>: <summary>" --body-file <file>
   ```

   A new PR has no number until it exists, so create it without the Test and
   Dev-links sections, then add them from the returned number with
   `gh pr edit <N> --body-file <file>`:

   ```bash
   gh pr create --draft --base develop --head <branch> --title "<KEY>: <summary>" --body-file <file>
   ```

5. **Report** the PR URL and the title. For an existing PR, say what was
   preserved vs rewritten. If no ticket key was found, flag it.

## Notes

- Scope is title + description only. Do not push, amend commits, or change code —
  if the diff itself needs work, that is a separate task.
- The repo's PR template (`.github/PULL_REQUEST_TEMPLATE.md`) ships only
  **Link to issue** and **Description**. The **Test** and **Dev links** sections
  are environment URLs derived from the PR number — this skill writes them
  explicitly (see the Body rules) rather than relying on them being injected, and
  keeps any other section already present untouched.
- Keeping ticket keys in code or commit messages is wrong (the repo is open
  source); the ticket number belongs in the PR title and the Jira link. This
  skill only edits PR metadata, so it never introduces keys into the codebase.
