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

We use `config_ignore_auto`, to avoid breaking stuff for especially webmaster
library sites.  As soon as you want to do anything with config (config-export,
config-import, etc.), read [the config documentation](../docs/cms/configuration-management.md) first.

## How the React apps end up on a page

The CMS embeds the `/react` apps via `hook_dpl_react_apps_data()` in
`.module` files (canonical example: `dpl_react_apps.module`). That hook is
where all data-attribute props (text strings, configs, service URLs) for the
embedded apps are declared. If a React-side change relies on a new prop, the
matching CMS-side entry is part of the work.

## Translations

All UI source strings are English. Localisation happens at runtime via PO
files distributed through GitHub — not through the admin UI — with strings
extracted from the codebase by potx (see ADR-018). Every `t()` /
`$this->t()` / `formatPlural()` must include a `context` argument *inline*;
the scanner matches on a flat token stream and cannot follow variables. The
default context is the module machine name.

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

## Caching — assume every response is cached somewhere

Responses pass through several cache layers before a user sees them:
Varnish, Drupal's page cache (anonymous users), Drupal's dynamic page
cache and render cache (all users), Next.js caches in GO, React Query in
the browser, and the browser's own HTTP cache. A response that depends on
_who_ is asking or _what state_ they are in, but does not say so, gets
cached and served to the wrong person. These bugs pass unit tests and
single-user manual tests, then show up in production as "it works again
after a cache clear".

Whenever you write or change code that returns a response, ask: _which
caches can store this, under which key, and what does it vary on?_ In
particular:

- **Redirects.** A redirect is a response like any other and is cached
  like any other. `TrustedRedirectResponse` is cacheable; a redirect
  decided by user, role, token type, session or login state must carry
  that as cache metadata (a cache context, or `max-age` 0). The anonymous
  page cache ignores cacheability metadata entirely — use the page cache
  kill switch there. Browsers cache 301/308 permanently, so use 302/303/307
  for anything conditional.
- **GraphQL and REST endpoints.** Results must carry cache tags for the
  data they contain (so edits invalidate them) and cache contexts for
  anything that varies by user, site or request (so users don't share
  them). Check what the GO side caches too (`fetch` cache, tags, and the
  `/cache/revalidate` route) — invalidating Drupal does not invalidate GO.
- **Render arrays and blocks** showing user-specific content (name,
  loans, login state) need `user` or a narrower context, or a lazy builder.
- **Event subscribers and middleware** that short-circuit the request
  (`$event->setResponse()`) bypass the normal render pipeline, so nothing
  adds cache metadata for you.
- **Lists and listings** need list cache tags (e.g. `node_list`) or new
  items won't appear until the cache expires.
- **Per-site variation.** 100+ sites share this codebase; anything
  depending on site config needs the config's cache tag.

**Test for it.** A test that makes one request as one user cannot catch a
cache bug. When behaviour varies by user or state, test the _sequence_:
request as user A, then the same URL as user B (or the same user after
login/logout/state change), and assert B gets B's response. At minimum, in
unit tests, assert the cache metadata (`max-age`, contexts, tags) on the
response.

## Gotchas worth knowing up front

- **Multi-site BNF.** A secondary site lives behind `docker-compose.bnf.yml`
  with `:bnf` variants of many Task targets. If something works in default
  but breaks in BNF, start there.
- **`docker-compose.yml` here is *not* production.** Production compose
  lives in the sibling `dpl-platform` repo. Don't expect parity.
