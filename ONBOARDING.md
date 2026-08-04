# Getting started with `dpl-web`

Four projects make up the platform. You only need the ones you work on — the
Storybooks (react, design-system) run on their own; go needs a CMS to talk to.

| Project | What it is | Dev command | URL |
|---|---|---|---|
| **react** | Embedded React apps | Storybook | <http://localhost:6006> |
| **design-system** | Shared HTML + CSS | Storybook | <https://design-system.local> |
| **cms** | Drupal backend | Docker | <https://dpl-cms.local> |
| **go** | Next.js youth site | `next dev` | <https://dpl-cms.local:3000> |

## Prerequisites

- [go-task](https://taskfile.dev) (`task`), [pnpm](https://pnpm.io/) (`corepack enable`), Node 24.15 (via [nvm](https://github.com/nvm-sh/nvm) — pinned in `.nvmrc`)
- [Docker](https://www.docker.com/) — [OrbStack](https://orbstack.dev/) recommended (auto-resolves the `*.local` dev domains)
- `mkcert` for local HTTPS (cms + go): `brew install mkcert && mkcert -install`
- 1Password CLI (`op`) — only for the `.env` generation flow below

## 1. Environment + dependencies

If you have access to the Reload 1Password, you can generate the main .env file
by running `task dev:dotenv:generate`.

If not, you can copy the template with a `cp .env.1pass .env` and then adjust
the contents as relevant.

When the `.env` file is in place, run (from the repo root):

```bash
task init   # symlink cms/.env, go/.env, react/.env + install deps
```

`cms/.env`, `go/.env` and `react/.env` are symlinks to the root `.env`. If one
goes missing, recreate them all with `task dev:dotenv:link`.

If you never create a `.env` yourself, the `dev:reset` tasks in `cms/`, `go/`
and `react/` bootstrap one from `.env.1pass`. That is enough to boot the
containers, but the third-party credentials stay unresolved until you run
`task dev:dotenv:generate`.

**Library token** (needed for React backend data): `task token:generate` mints a
token and writes it to `STORYBOOK_LIBRARY_TOKEN` in `.env`. It needs
`ADGANGSPLATFORMEN_*` set. Restart Storybook afterwards.

## 2. Run the apps

### React — Storybook

```bash
cd react && task dev:storybook      # Storybook only, no Docker
```

Open <http://localhost:6006> (it does not auto-open). Apps hit the **real DBC
backends** by default. To use local mocks instead, start Wiremock first:
`task dev:mocks:start` (Docker). For the full Docker setup in one go: `task dev:reset`.

### Design System — Storybook

```bash
cd design-system && task dev:start  # Docker
```

Open <https://design-system.local>. Uses no `.env`.

### CMS — Drupal

```bash
task cms:reset      # first-time: heavy build from a DB snapshot; also builds +
                    # links design-system and react into the CMS
task cms:start      # day-to-day: brings the site up and prints an admin login link
```

Open <https://dpl-cms.local>. Test users have password `test`. (Requires the
`mkcert` HTTPS setup from Prerequisites.)

### Go — Next.js

Needs a CMS to talk to (local, or a remote instance via `DPL_CMS_BASE_URL`).

```bash
cd go && pnpm run dev:https
```

Open <https://dpl-cms.local:3000>. (Env and dependencies are already set up by
Step 1, so Go just needs its dev server.)

## Notes

- Env is read when a dev server starts — **restart** after changing `.env`.
- After changing react/design-system, rebuild the assets into the CMS with
  `task dev:cms:link`.
- `task dev:dotenv:generate` needs the `op` CLI + DDF vault access.
