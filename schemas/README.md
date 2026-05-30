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
   `openapi-generator-cli` at codegen time; nothing reads them at runtime.
4. **GraphQL schemas are NOT here.** They are introspected live at
   codegen time (`drush sailor:introspect`, `graphql-codegen` against a
   running CMS) and never vendored.
5. **`cms/openapi.json` stays in `cms/`.** It's an artifact produced by
   the Drupal CMS itself, not an upstream contract.

## Refresh

Each spec has its own upstream story. Hand-editing is fine where a row
below says so; otherwise use the refresh task.

| Spec | Upstream | Refresh |
|---|---|---|
| `openapi/material-list.yaml` | `danskernesdigitalebibliotek/ddb-material-list@develop` | `task schemas:refresh:material-list` |
| `openapi/fbs-adapter.yaml` | FBS swagger 1.2 (Cicero), converted via [`itk-dev/dpl-fbs-adapter-tool`](https://github.com/itk-dev/dpl-fbs-adapter-tool) | `task schemas:refresh:fbs` (clones the tool into `.cache/`, runs its docker pipeline) |
| `openapi/publizon-adapter.yaml` | None — edit by hand | `task schemas:refresh:publizon` *(stub that prints this)* |


```sh
task schemas:refresh          # rebuild schemas from respective sources
task schemas:format           # prettier-format the schemas (also run by :refresh)
```

## Regenerate clients

Codegen is owned by each consuming project. After updating a contract
here, run that project's `task codegen:all`.

## Drift artifacts

`*-drift.diff` files next to a canonical YAML record semantic drift that
hasn't been reconciled yet. Not used by tooling — delete once resolved.
