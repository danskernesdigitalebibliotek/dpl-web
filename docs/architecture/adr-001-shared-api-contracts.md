# Shared API contracts in `/schemas`

## Context

Four sub-projects (`react/`, `go/`, `cms/`, `packages/service-layer/`)
consume the same external APIs. Historically each owned its own copy of
every contract — duplicated OpenAPI YAML, separate GraphQL codegen
pipelines that live-introspected upstream services at build time.

### Problems:

The main motivation for cleaning up the schemas, was that we wanted better
GitHub actions for catching problems, especially in relation to Dependabot
updates. This was blocked by a few things, which `/schemas` would solve:

1. **Drift.** The same FBS adapter spec was tracked in three places
   with no enforced equivalence.
2. **Introspect and codegen was baked together**
   Running codegen for external services (such as FBI) also included running an
   introspect against the actual service. That meant that we could not set up
   a code-drift action for PR, as they could contain unrelated changes
3. **Some codegen needed dynamic tokens**
   The library tokens needed to be generated dynamically, and would have made
   GitHub actions extra complicated to construct.
4. **Codegen needed running services.** GraphQL codegen introspected a
   live `dpl-cms` (full Drupal + Varnish + Basic Auth credentials) and
   the DBC FBI gateways. CI had to spin up the stack to generate
   client types, and the resulting SDL varied with the running site's
   language pack and Drupal's module-load order — producing spurious
   schema diffs.
   This was not a critical problem, but it would be nice to clean up.

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
