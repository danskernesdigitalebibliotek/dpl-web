# Shared API contracts in `/schemas`

## Context

Four sub-projects (`react/`, `go/`, `cms/`, `packages/service-layer/`)
consume the same external APIs. Historically each owned its own copy of
every contract — duplicated OpenAPI YAML, separate GraphQL codegen
pipelines that live-introspected upstream services at build time.

Three concrete problems followed:

1. **Drift.** The same FBS adapter spec was tracked in three places
   with no enforced equivalence.
2. **Codegen needed running services.** GraphQL codegen introspected a
   live `dpl-cms` (full Drupal + Varnish + Basic Auth credentials) and
   the DBC FBI gateways. CI had to spin up the stack to generate
   client types, and the resulting SDL varied with the running site's
   language pack and Drupal's module-load order — producing spurious
   schema diffs.
3. **No central refresh story.** Each sub-project had its own ad-hoc
   refresh script and codegen flow. Onboarding meant learning four.

## Decision

Introduce a repo-root `/schemas` directory as the single source of
truth for API contracts shared across sub-projects or sourced from an
external system. Generated clients stay in each sub-project; only the
contracts move.

Design rules, refresh tasks, and the per-spec table live in
[`/schemas/README.md`](../../schemas/README.md). The short version:

- One contract, one file. Generated code stays per-sub-project.
- All GraphQL schemas are vendored as SDL — codegen never
  live-introspects. The vendored SDL is description-stripped and
  lexicographically sorted at refresh time so it doesn't wobble with
  the introspected site's environment.
- Refresh runs through `task -d schemas refresh:<name>` in an
  ephemeral Docker container; `/schemas` itself has no host toolchain.

Drift between the vendored SDL and freshly-generated clients is
enforced by per-sub-project codegen workflows
([`cms-codegen.yml`](../../.github/workflows/cms-codegen.yml),
[`go-codegen.yml`](../../.github/workflows/go-codegen.yml),
[`react-codegen.yml`](../../.github/workflows/react-codegen.yml))
that re-run codegen and `git diff --exit-code` the result.

## Alternatives considered

- **Per-sub-project live introspection (the status quo).** Rejected —
  the three problems above are intrinsic to it.
- **Per-sub-project vendored SDL, no `/schemas` directory.** Removes
  the running-service dependency but not the drift, and doesn't give
  us a central refresh story. Three independent snapshots of the same
  FBS spec is exactly what we're eliminating.
- **Git submodule for shared contracts.** Overkill: four consumers in
  one monorepo doesn't justify the cross-repo PR friction.
- **Monorepo workspace package** (`packages/api-contracts`). Rejected
  because the contracts aren't JS — wrapping a directory of YAML/SDL
  in a `package.json` adds ceremony without buying anything.

## Consequences

- Refreshing an upstream API is one `task -d schemas refresh:<name>`
  call; each sub-project then runs its own `task codegen`.
- Codegen has no runtime-service dependency — credentials and a
  running CMS are needed only at refresh time, locally.
- Vendored SDL is stable across environments (Drupal locale, module
  load order) thanks to the strip-and-sort step.
- Drift is enforced, not aspired: forgetting to commit regenerated
  client code breaks CI per sub-project.
- Refreshing requires Docker — `/schemas` has no host toolchain. CI
  and most dev environments already have it.
