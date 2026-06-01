# schemas/

> ## 🚨 ACTION REQUIRED ON NEXT DBC-FBI REFRESH 🚨
>
> **Do not just re-run the existing refresh tasks.** As of 2026-06-01,
> `graphql/dbc-fbi.temp-next.graphql` and `graphql/dbc-fbi.fbcms-go.graphql`
> are byte-identical — `temp-next` has caught up to `fbcms-go`.
>
> On the next refresh, **collapse them into a single `graphql/dbc-fbi.graphql`**
> sourced from `fbi-api.dbc.dk/fbcms-go` (the canonical truth), and repoint
> `react/`, `go/`, and `cms/` codegen at the merged file. Then delete the
> per-consumer rows from the refresh table below.

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

   **See the banner above** — the two `dbc-fbi.*.graphql` files are due
   to be collapsed into one on the next refresh.
5. **`cms/openapi.json` stays in `cms/`.** It's an artifact produced by
   the Drupal CMS itself, not an upstream contract.

## Refresh

| Spec | Upstream                                                                                                                                                | Refresh |
|---|---------------------------------------------------------------------------------------------------------------------------------------------------------|---|
| `graphql/dbc-fbi.temp-next.graphql` | DBC FBI gateway @ `temp.fbi-api.dbc.dk/next` (will be removed on next refresh - see above) — consumed by `react/`                                       | `task schemas:refresh:dbc-fbi:temp-next` |
| `graphql/dbc-fbi.fbcms-go.graphql` | DBC FBI gateway @ `fbi-api.dbc.dk/fbcms-go` (prod host, profile matching go's runtime) — consumed by `go/` and `cms/` (via Sailor in the cli container) | `task schemas:refresh:dbc-fbi:fbcms-go` |
| `openapi/material-list.yaml` | `danskernesdigitalebibliotek/ddb-material-list@develop`                                                                                                 | `task schemas:refresh:material-list` |
| `openapi/fbs-adapter.yaml` | FBS swagger 1.2 (Cicero), converted via [`itk-dev/dpl-fbs-adapter-tool`](https://github.com/itk-dev/dpl-fbs-adapter-tool)                               | `task schemas:refresh:fbs` (clones the tool into `.cache/`, runs its docker pipeline) |
| `openapi/publizon-adapter.yaml` | None — edit by hand                                                                                                                                     | `task schemas:refresh:publizon` *(stub that prints this)* |


All refresh/format tasks run in Docker — `schemas/` has no local
toolchain (no `node_modules`, no `npm install`). The DBC FBI refresh
tasks additionally need a bearer token: copy `schemas/.env.example` to
`schemas/.env` and fill in `LIBRARY_TOKEN` — `Taskfile.yml` loads it
via `dotenv:`.

```sh
task schemas:refresh          # rebuild schemas from respective sources
task schemas:format           # prettier-format the schemas (also run by :refresh)
```

## Regenerate clients

Codegen is owned by each consuming project. After updating a contract
here, run that project's `task codegen:all`.
