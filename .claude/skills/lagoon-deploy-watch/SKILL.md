---
name: lagoon-deploy-watch
description: Watches the Lagoon deployment triggered by the latest git push and reports its progress in chat and in the Claude Code status line until it completes or fails. Use when the user asks whether their deployment/build is done, to watch, follow or poll a Lagoon deploy, or says "tell me when it's deployed".
---

# Lagoon deploy watch

`scripts/watch.sh` resolves the Lagoon project and environment from the current
branch, then polls `lagoon list deployments` until the build finishes. It prints
one line per change of status or build step and mirrors the state to
`$XDG_CACHE_HOME/lagoon-deploy-watch/` (default `~/.cache`), which `scripts/statusline.sh` shows in the
status line. Run it from inside the repo/worktree that was pushed.

**Read-only:** use only `lagoon list …` and `lagoon get …`. Never deploy,
redeploy, ssh, run tasks or change/delete environments — not even to retry a
failed build. If a build fails, report it and let the user decide.

## Workflow

1. Start it with the **Monitor** tool, so each line arrives as a notification
   while the user works on other things:
   - command: `"$(git rev-parse --show-toplevel)/.claude/skills/lagoon-deploy-watch/scripts/watch.sh"` (add
     `-p <project>`, `-e <env>`, or `-d <deployment-name>` only if the user
     names them or auto-detection fails)
   - description: `Lagoon deploy <env>`
   - timeout_ms: `1800000`
2. Confirm in one line what is being watched (project, environment, deployment).
3. For each notification, post one short line to the user (status · step ·
   elapsed). Don't run anything else for it.
4. If the monitor expires before the build ends, re-arm it with
   `-d <deployment-name>` (from the first line) so it keeps watching the
   same build rather than looking for a new one.
5. When it ends:
   - **complete**: say so and give the environment's route if known
     (`lagoon get environment -p <project> -e <env> --output-json`).
   - **failed/cancelled/error**: run the printed `Logs:` command, find the
     failing step, and quote the relevant error lines with a short diagnosis.
   - **ERROR:** (exit 2, couldn't resolve something): report the message and
     ask for the missing `-p`/`-e`/`-d`.

## Notes

- Environment: `pr-<N>` when the branch has an open PR, else the branch name
  with `/` → `-`.
- Project: the Lagoon project whose git URL matches `origin` and has that
  environment; before a new PR's environment exists, the one named after the
  repo. In dpl-web, `.lagoon.yml`'s `project:` is *not* the Lagoon project
  name; the real one is `dpl-web`.
- Estimate (progress bar, "8m/~11m"): average of the last 5 successful deploys
  of the environment, else of the production environment, else none (elapsed
  time only).
- If the newest deployment finished before HEAD was committed, the script
  waits up to 20 minutes for the push's build to be queued.
- The status line is opt-in per developer: add a `statusLine` entry
  (`"type": "command"`) to your own `~/.claude/settings.json` pointing at
  `scripts/statusline.sh` in your checkout (absolute path). Without it you
  still get the chat notifications.
