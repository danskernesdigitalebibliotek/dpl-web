# schemas/

> ## 🚨 STATUS: dbc-fbi snapshots cannot be consolidated yet 🚨
>
> The earlier plan to collapse the two `dbc-fbi.*.graphql` files into one
> is **on hold**. Upstream has removed the `submitOrder` mutation from
> every profile we can introspect (`fbi-api.dbc.dk/next`,
> `temp.fbi-api.dbc.dk/next`, `fbi-api.dbc.dk/fbcms-go` — checked
> 2026-08-05), while `react/` still ships the `openOrder` mutation that
> reservations depend on.
>
> Until that is resolved, `dbc-fbi.temp-next.graphql` is **not a pure
> introspection snapshot**: it is the last snapshot that still contains
> `SubmitOrder`, with the `Retriever*` definitions (AccessUnion member,
> `Query.retriever`, and the four `Retriever*` types) hand-copied from the
> refreshed `fbcms-go` snapshot. **Do not re-run
> `task schemas:refresh:dbc-fbi:temp-next`** — it will drop `submitOrder`
> and break react codegen. First find out where order submission is
> supposed to live now; then refresh, and if the profiles really are
> identical again, do the single-file consolidation described in the git
> history of this README.

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
4. **External GraphQL schemas are vendored here as SDL.** Third-party
   schemas (the DBC FBI gateway, vendored once per host+profile as
   `dbc-fbi.temp-next.graphql` + `dbc-fbi.fbcms-go.graphql`) are checked
   in so codegen doesn't need a bearer token. Schemas defined by our
   own code are vendored alongside their producer instead — see rule 5.

   **See the banner above** — `dbc-fbi.temp-next.graphql` currently
   carries a hand-applied patch and must not be blindly refreshed.
5. **CMS-produced artifacts stay in `cms/`.** `cms/openapi.json` (REST
   surface) and `cms/dpl-cms.bnf.graphql` (BNF GraphQL SDL,
   snapshotted via Sailor) are artifacts produced by the Drupal CMS
   itself, not upstream contracts — they live next to the code that
   generates them. `go/` codegen reads them from `cms/` directly.

## Refresh

| Spec | Upstream                                                                                                                                                | Refresh |
|---|---------------------------------------------------------------------------------------------------------------------------------------------------------|---|
| `graphql/dbc-fbi.temp-next.graphql` | DBC FBI gateway @ `temp.fbi-api.dbc.dk/next` (⚠️ hand-patched, do not refresh — see banner) — consumed by `react/`                                      | `task schemas:refresh:dbc-fbi:temp-next` |
| `graphql/dbc-fbi.fbcms-go.graphql` | DBC FBI gateway @ `fbi-api.dbc.dk/fbcms-go` (prod host, profile matching go's runtime) — consumed by `go/` and `cms/` (via Sailor in the cli container) | `task schemas:refresh:dbc-fbi:fbcms-go` |
| `openapi/material-list.yaml` | `danskernesdigitalebibliotek/ddb-material-list@develop`                                                                                                 | `task schemas:refresh:material-list` |
| `openapi/fbs-adapter.yaml` | FBS swagger 1.2 (Cicero), converted via [`itk-dev/dpl-fbs-adapter-tool`](https://github.com/itk-dev/dpl-fbs-adapter-tool)                               | `task schemas:refresh:fbs` (clones the tool into `.cache/`, runs its docker pipeline) |
| `openapi/publizon-adapter.yaml` | None — edit by hand                                                                                                                                     | `task schemas:refresh:publizon` *(stub that prints this)* |


All refresh/format tasks run in Docker — `schemas/` has no local
toolchain (no `node_modules`, no `npm install`). The DBC FBI refresh
tasks additionally need a bearer token: set `LIBRARY_TOKEN` in the central
root `.env` (see the repo-root `.env.1pass`, or run `task token:generate`) —
`schemas/Taskfile.yml` loads it via `dotenv: ['../.env']`.

```sh
task schemas:refresh          # rebuild schemas from respective sources
task schemas:format           # prettier-format the schemas (also run by :refresh)
```

## Regenerate clients

Codegen is owned by each consuming project. After updating a contract
here, run the relevant `task codegen:*` tasks in the consuming project
(see each sub-project's `Taskfile.yml` — `task codegen` shows the
available codegen tasks).

## TO-DOs
- Move SOAP parts to `/schemas` also. (`/go/lib/soap`)
- Consider more strict GH Action triggers, rather than broad (e.g. `/go/**`)
