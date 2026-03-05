# Migration tasks

This folder contains the task setup used to migrate commits from the DPL repos into this monorepo.

## Normal flow

Run one of these:

- `task migration:mono:cms:migrate:commits`
- `task migration:mono:go:migrate:commits`
- `task migration:mono:react:migrate:commits`
- `task migration:mono:design-system:migrate:commits`

Each run:

- reads the current checkpoint from `migration/.migration-info`
- finds commits between that checkpoint and current `develop` in the source repo
- applies them in order with `git am`
- updates the checkpoint when the run finishes

## Important files

- `migration/.migration-info`  
  Stores one checkpoint SHA per repo.

- `migration/.migration-progress/`  
  Temporary progress cache used to resume safely after failures.  
  This is runtime state and is gitignored.

## If a commit fails

1. Resolve and continue:
   - `git status`
   - fix conflicts
   - `git add <files>`
   - `git am --continue`

2. Or skip it:
   - `git am --skip`
   - `task migration:mono:migration:mark-processed REPO=dpl-cms COMMIT=<sha>`

Then rerun the migration task.

## Useful helpers

- Update marker directly:
  - `task migration:mono:migration:update-marker REPO=dpl-cms COMMIT=<sha>`

- Re-sync marker by author date:
  - `task migration:mono:migration:sync-marker-by-author-date REPO=dpl-cms PROJECT=cms`
  - or with explicit date:
  - `task migration:mono:migration:sync-marker-by-author-date REPO=dpl-cms PROJECT=cms DATE=2026-03-05T00:00:00Z`

- Refresh lock/translation files that are intentionally skipped in commit migration:
  - `task migration:mono:migration:fetch-skip-files`
