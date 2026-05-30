# schemas/

Single source of truth for API contracts shared across sub-projects or
sourced from an external system. Generated clients live inside each
sub-project; only the contracts live here.

## Design rules

1. **One contract, one file.** Any OpenAPI YAML shared between sub-projects
   (or fetched from an external source) lives here and nowhere else.
2. **Generated code stays in each sub-project.** `react/`, `go/`, `cms/`,
   and `packages/service-layer/` deploy independently; duplicated generated
   code between them is fine, duplicated *contracts* are not.
3. **Contracts are codegen-only.** Read by `orval` /
   `openapi-generator-cli` / `graphql-codegen` at codegen time; nothing
   reads them at runtime.
4. **External GraphQL schemas are vendored as SDL; internal ones aren't.**
   Third-party schemas (the DBC FBI gateway, vendored once per host+profile
   as `dbc-fbi.temp-next.graphql` + `dbc-fbi.fbcms-go.graphql`) are checked
   in so codegen doesn't need a bearer token. Schemas defined by our own
   code (the dpl-cms GraphQL endpoint, CMS modules that define their own
   types) stay introspected live — live introspection is its own
   consistency check.
5. **`cms/openapi.json` stays in `cms/`.** It's an artifact produced by
   the Drupal CMS itself, not an upstream contract.

## Refresh

Each spec has its own upstream story. Hand-editing is fine where a row
below says so; otherwise use the refresh task.

| Spec | Upstream | Refresh |
|---|---|---|
| `graphql/dbc-fbi.temp-next.graphql` | DBC FBI gateway @ `temp.fbi-api.dbc.dk/next` (DBC's preview host) — consumed by `react/` | `task schemas:refresh:dbc-fbi:temp-next` |
| `graphql/dbc-fbi.fbcms-go.graphql` | DBC FBI gateway @ `fbi-api.dbc.dk/fbcms-go` (prod host, profile matching go's runtime) — consumed by `go/` and `cms/` (via Sailor in the cli container) | `task schemas:refresh:dbc-fbi:fbcms-go` |
| `openapi/material-list.yaml` | `danskernesdigitalebibliotek/ddb-material-list@develop` | `task schemas:refresh:material-list` |
| `openapi/fbs-adapter.yaml` | FBS swagger 1.2 (Cicero), converted via [`itk-dev/dpl-fbs-adapter-tool`](https://github.com/itk-dev/dpl-fbs-adapter-tool) | `task schemas:refresh:fbs` (clones the tool into `.cache/`, runs its docker pipeline) |
| `openapi/publizon-adapter.yaml` | None — edit by hand | `task schemas:refresh:publizon` *(stub that prints this)* |


```sh
task schemas:refresh          # rebuild schemas from respective sources
task schemas:format           # prettier-format the schemas (also run by :refresh)
```

The two `dbc-fbi.*.graphql` files are the same gateway at different host+profile combinations. `temp-next` (DBC's preview host) gets new features first — e.g. the `submitOrder` mutation `react/` uses; `fbcms-go` is a stable prod-host profile that matches `go/`'s runtime. They share a single bearer token, picked up from the shell, `react/.env`, or `go/.env`.

> `cms/` reads `dbc-fbi.fbcms-go.graphql` but its runtime actually hits the `next` profile on the prod host (see `cms/web/modules/custom/dpl_fbi/src/Fbi.php`). The two prod-host profiles overlap on every field cms currently queries — revisit if cms starts using fields that diverge between profiles.

## Regenerate clients

Codegen is owned by each consuming project. After updating a contract
here, run that project's `task codegen:all`.

## Drift artifacts

`*-drift.diff` files next to a canonical YAML record semantic drift that
hasn't been reconciled yet. Not used by tooling — delete once resolved.
