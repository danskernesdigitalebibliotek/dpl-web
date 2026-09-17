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
4. **External GraphQL schemas are vendored here as SDL.** Third-party
   schemas (the DBC FBI gateway, vendored as `dbc-fbi.graphql`) are checked
   in so codegen doesn't need a bearer token. Schemas defined by our own
   code are vendored alongside their producer instead — see rule 5.
5. **CMS-produced artifacts stay in `cms/`.** `cms/openapi.json` (REST
   surface) and `cms/dpl-cms.bnf.graphql` (BNF GraphQL SDL,
   snapshotted via Sailor) are artifacts produced by the Drupal CMS
   itself, not upstream contracts — they live next to the code that
   generates them. `go/` codegen reads them from `cms/` directly.

## The FBI gateway: one snapshot, and why it must be authenticated

`graphql/dbc-fbi.graphql` is the whole upstream schema, introspected from
`fbi-api.dbc.dk/fbcms-go` and consumed by `react/`, `go/` and `cms/`
alike. The gateway's profiles (`next`, `next-present`, `fbcms-go`) serve
the same schema, so one snapshot covers every consumer regardless of
which profile it talks to at runtime. Pick the profile in runtime config,
not here.

**Introspection must be authenticated.** The gateway does not reject a
missing or empty bearer token — it treats the caller as anonymous and
serves a *reduced* schema. `Mutation.submitOrder` and its input and
response types are among the fields missing from it, so an anonymous
refresh silently vendors a contract that is a subset of what our clients
actually query, and react's `openOrder` document then fails to validate
against it.

`_introspect-fbi` therefore refuses to run without `LIBRARY_TOKEN`, and
checks the result for `AUTH_ONLY_SENTINEL` before keeping it — a token
that is present but expired, revoked or under-privileged still returns
200 with the anonymous schema, which a presence check alone would miss.
A snapshot that fails the check is set aside as `.rejected`.

One environment gotcha behind both: `task`'s `dotenv` does not override a
variable already exported by your shell. If `LIBRARY_TOKEN` is exported
empty, the value in `.env` is ignored and every refresh runs anonymously.
Unset it in your shell rather than fighting the Taskfile.

## Refresh

These tasks live in `schemas/Taskfile.yml`, which the repo-root
`Taskfile.yml` does **not** include — run them from this directory.
There is no `schemas:` prefix.

| Spec | Upstream                                                                                                                                                | Refresh |
|---|---------------------------------------------------------------------------------------------------------------------------------------------------------|---|
| `graphql/dbc-fbi.graphql` | DBC FBI gateway @ `fbi-api.dbc.dk/fbcms-go` — consumed by `react/`, `go/`, `cms/` (via Sailor in the cli container) and `packages/service-layer/` | `task refresh:dbc-fbi` |
| `openapi/material-list.yaml` | `danskernesdigitalebibliotek/ddb-material-list@develop`                                                                                                 | `task refresh:material-list` |
| `openapi/fbs-adapter.yaml` | FBS swagger 1.2 (Cicero), converted via [`itk-dev/dpl-fbs-adapter-tool`](https://github.com/itk-dev/dpl-fbs-adapter-tool)                               | `task refresh:fbs` (clones the tool into `.cache/`, runs its docker pipeline) |
| `openapi/publizon-adapter.yaml` | None — edit by hand                                                                                                                                     | `task refresh:publizon` *(stub that prints this)* |
| `openapi/biblio-adapter.yaml` | Biblio adapter (DBC) @ [`biblio-adapter.dbc.dk/docs`](https://biblio-adapter.dbc.dk/docs) — consumed by `packages/service-layer/`                                        | Manual: use the "Download OpenAPI specification" button on the docs page and convert the JSON to YAML |


All refresh/format tasks run in Docker — `schemas/` has no local
toolchain (no `node_modules`, no `npm install`). The DBC FBI refresh
task additionally needs a bearer token: set `LIBRARY_TOKEN` in the central
root `.env` (see the repo-root `.env.1pass`, or run `task token:generate`
from the repo root) — `schemas/Taskfile.yml` loads it via
`dotenv: ['../.env']`.

```sh
task refresh          # rebuild schemas from respective sources
task format           # prettier-format the schemas (also run by :refresh)
```

Note that every `refresh:*` task chains `task: format`, which formats
**all** of `openapi/` and `graphql/` — not just the file being refreshed.

## Regenerate clients

Codegen is owned by each consuming project. After updating a contract
here, run the relevant `task codegen:*` tasks in the consuming project
(see each sub-project's `Taskfile.yml` — `task codegen` shows the
available codegen tasks).

Refreshing `dbc-fbi.graphql` touches every consumer at once: react's
`task codegen:dbc:gateway`, go's `task codegen:graphql`, cms's
`task dev:codegen:fbi-graphql` (Sailor, needs the cli container running), and
service-layer's `task codegen:fbi`. Re-run them all and typecheck each
project — upstream drift regularly adds and removes types that the generated
clients export, and TypeScript code importing a removed type will not be
caught by validating the `.graphql` documents alone.

## TO-DOs
- Move SOAP parts to `/schemas` also. (`/go/lib/soap`)
- Consider more strict GH Action triggers, rather than broad (e.g. `/go/**`)
