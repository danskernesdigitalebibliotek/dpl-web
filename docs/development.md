# Cross-Project Development

How to develop across CMS, React, and design-system using the root `Taskfile.yml`.

## Prerequisites

- [go-task](https://taskfile.dev)
- Docker
- Node.js + Yarn

## CMS + React Development

```bash
# First: install Drupal and set up the CMS environment
task cms:reset

# Build design-system + React, copy into CMS, and watch for changes
task dev:cms-react --watch
```

`cms:reset` installs Drupal and sets up the Docker environment. You only need to run it once.

`dev:cms-react --watch` starts the CMS containers, builds design-system and React, copies the assets into CMS, and watches for changes. When you edit a file in `design-system/` or `react/`, Task rebuilds only what changed and re-copies into CMS.

### What `dev:cms-react` does

1. `yarn install` in design-system and react (skipped if `package.json`/`yarn.lock` unchanged)
2. Builds design-system (SCSS → CSS, bundles icons/fonts/JS into `build/`)
3. Links design-system into React via `yarn link`
4. Builds React (webpack → `dist/`)
5. Copies build artifacts into CMS filesystem
6. Clears Drupal cache

### Where assets end up

```
design-system/build/{css,js,icons,fonts}  →  cms/web/themes/custom/novel/assets/dpl-design-system/
react/dist/*                              →  cms/web/libraries/dpl-react/
```

## Other commands

| Command                    | Description                                              |
| -------------------------- | -------------------------------------------------------- |
| `task init`                | Install JS dependencies for design-system, react, and go |
| `task cms:reset`           | Reset CMS Docker environment                             |
| `task react:start`         | Start React dev server (Storybook)                       |
| `task design-system:start` | Start design-system Storybook                            |
| `task go:reset`            | Reset Go dev environment                                 |

Each sub-project also works standalone: `cd cms && task dev:reset`, etc.

## Troubleshooting

### `origin/main` not found

```bash
git fetch origin main:refs/remotes/origin/main
```

### Task says "up to date" but assets are stale

```bash
rm -rf .task
task dev:cms-react
```
