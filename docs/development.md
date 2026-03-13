# Cross-Project Development

This document describes how to develop across multiple projects in the monorepo using the root `Taskfile.yml`.

## Prerequisites

- [go-task](https://taskfile.dev) installed
- Docker running
- Node.js + Yarn installed

## Quick Reference

| Command | Description |
|---------|-------------|
| `task init` | Install JS dependencies for design-system, react, and go |
| `task dev:cms-react` | Full setup: build everything + copy assets into CMS |
| `task dev:cms-react --watch` | Same as above, then watch for changes and rebuild |
| `task cms:reset` | Reset CMS Docker environment |
| `task react:start` | Start React dev server (Storybook) |
| `task design-system:start` | Start design-system dev server (Storybook) |
| `task go:reset` | Start Go dev environment |

## CMS + React Development

The main cross-project workflow builds the design-system and React, then copies the built assets into the CMS filesystem where Drupal can serve them.

### First-time setup

```bash
task dev:cms-react
```

This runs the following steps:

1. **`init:design-system`** / **`init:react`** - `yarn install` in each project (skipped if `node_modules/` exists)
2. **`dev:design-system:build`** - Compiles SCSS and bundles CSS, JS, icons, and fonts into `design-system/build/`
3. **`dev:design-system:link`** - Registers the design-system as a `yarn link` source
4. **`dev:react:link`** - Links the local design-system into React via `yarn link`
5. **`dev:react:build`** - Builds React components with webpack into `react/dist/`
6. **`dev:cms:link`** - Copies build artifacts into CMS:
   - `design-system/build/` → `cms/web/themes/custom/novel/assets/dpl-design-system/`
   - `react/dist/` → `cms/web/libraries/dpl-react/`
7. Clears the Drupal cache
8. Prints a one-time login link

### Watch mode (live-reload)

```bash
task dev:cms-react --watch
```

Task monitors the `sources` defined on each build task. When a file changes, only the affected tasks re-run:

- Edit a `.scss` file in `design-system/` → rebuilds design-system → re-copies to CMS → clears cache
- Edit a `.tsx` file in `react/` → rebuilds React → re-copies to CMS → clears cache

This uses Task's built-in `--watch` flag with `sources`/`generates` timestamp comparison — the same approach as the old dapple setup.

## How asset linking works

The CMS expects design-system and React assets at specific paths within its filesystem. Since the CMS Docker containers bind-mount the `cms/` directory, we copy built assets directly into the filesystem (no `docker compose cp` needed).

```
design-system/build/
├── css/base.css         →  cms/web/themes/custom/novel/assets/dpl-design-system/css/
├── js/*.js              →  cms/web/themes/custom/novel/assets/dpl-design-system/js/
├── icons/               →  cms/web/themes/custom/novel/assets/dpl-design-system/icons/
└── fonts/               →  cms/web/themes/custom/novel/assets/dpl-design-system/fonts/

react/dist/
└── *.js, *.css          →  cms/web/libraries/dpl-react/
```

## Running individual sub-projects

Each sub-project still has its own `Taskfile.yml` for standalone use:

```bash
cd cms && task dev:reset
cd react && task dev:start
cd design-system && task dev:start
cd go && task dev:reset
```

Or from the root via delegation:

```bash
task cms:reset
task react:start
task design-system:start
task go:reset
```

## Troubleshooting

### `origin/main` not found

The sub-project Taskfiles reference `git rev-list --count origin/main`. If you haven't fetched `main`:

```bash
git fetch origin main:refs/remotes/origin/main
```

### Node engine mismatch

The `init` tasks use `yarn install --ignore-engines` to work around strict Node version checks. If you encounter issues, check the `.nvmrc` in each sub-project for the expected version.

### Task says "up to date" but assets are stale

Delete the Task checksum cache and re-run:

```bash
rm -rf .task
task dev:cms-react
```
