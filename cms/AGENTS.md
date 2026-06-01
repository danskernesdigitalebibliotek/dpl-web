# AGENTS.md — cms

Context for working in the DPL CMS — a **Drupal distribution** that is
deployed from this single codebase to **100+ individual library
sites**.

Read [the root `AGENTS.md`](../AGENTS.md) first if you haven't.

## What this is, in one paragraph

This is not a Drupal site. It is a *distribution*: a configurable Drupal
product that ~100 libraries install and run, each with their own content and
some freedom to vary their setup. The hardest constraint follows from that —
**every change to default behaviour is a breaking change for someone.** When
in doubt, add a toggle and default to the existing behaviour.

## Site types — the variability model

A library can be running this codebase under one of these "site types":

- **Core** — pristine defaults, used in dev / CI.
- **Editor** — UI configuration only, picking from predefined options.
  Most production sites.
- **Webmaster** — library may install additional approved modules.

Don't assume any particular module is enabled. When integrating with one,
check via `moduleHandler()->moduleExists(...)` first.

## Configuration management — the highest-risk area

The mechanism is **`config_ignore_auto`**: *all* config is ignored on import
by default. Core-managed config is opted in *explicitly* with a `~` prefix
in `config_ignore.settings.ignored_config_entities`. Forgetting that prefix
means your change will not actually deploy. Forgetting it the *other* way —
adding a key that should have stayed library-controllable — silently
overrides what libraries had configured.

This is the single area where mistakes propagate to all 100 sites. Read
[`../docs/cms/configuration-management.md`](../docs/cms/configuration-management.md)
before touching configuration. Deployments always use `drush deploy` (it
orders updatedb → cache rebuild → config import → deploy hooks correctly);
never `drush config-import` raw.

## How the React apps end up on a page

The CMS embeds the `/react` apps via `hook_dpl_react_apps_data()` in
`.module` files (canonical example: `dpl_react_apps.module`). That hook is
where all data-attribute props (text strings, configs, service URLs) for the
embedded apps are declared. If a React-side change relies on a new prop, the
matching CMS-side entry is part of the work.

## Translations

All UI source strings are English. Localisation happens at runtime via PO
files distributed through GitHub (see ADR-009 — runtime, not admin-UI).
Every `t()` / `$this->t()` / `formatPlural()` must include a `context`
argument *inline*; the codebase scanner that extracts strings cannot follow
variables. The default context is the module machine name.

## Patches, not forks

Contrib modules are patched via `cweagans/composer-patches`, with the patch
under `cms/patches/` and a reference in `composer.json`'s `extra.patches`.
Before debugging a contrib quirk, check `patches/` — it may already be
known.

## Where to learn more

- [`../docs/cms/`](../docs/cms/) — long-form docs (configuration management,
  API development, logging, translation, webmaster modules, …).
- [`../docs/cms/architecture/`](../docs/cms/architecture/) — ADRs.
- `composer.json`, `patches/`, `web/modules/custom/`, `web/themes/custom/`,
  `config/sync/` — sources of truth for current state.
- `Taskfile.yml` — the catalog of dev/CI commands.
- `openapi.json` — generated, checked-in REST surface (Swagger 2.0). When a
  REST resource changes, this needs regenerating and committing alongside.

## Gotchas worth knowing up front

- **Multi-site BNF.** A secondary site lives behind `docker-compose.bnf.yml`
  with `:bnf` variants of many Task targets. If something works in default
  but breaks in BNF, start there.
- **`docker-compose.yml` here is *not* production.** Production compose
  lives in the sibling `dpl-platform` repo. Don't expect parity.
- **Install profile has no `install:` dependencies.** Module enable/disable
  goes through update hooks in `dpl_update.install`, not the profile's
  `.info.yml`.
