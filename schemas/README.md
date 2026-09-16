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

## The FBI gateway: one snapshot, one local extension

`graphql/dbc-fbi.graphql` is the whole upstream schema, introspected from
`fbi-api.dbc.dk/fbcms-go` and consumed by `react/`, `go/` and `cms/`
alike. The gateway's profiles (`next`, `next-present`, `fbcms-go`) serve
byte-identical schemas — verified by introspecting all three on the same
day — so one snapshot covers every consumer regardless of which profile
it talks to at runtime. Pick the profile in runtime config, not here.

`graphql/dbc-fbi.local-submit-order.graphql` is **not** upstream schema.
It is a hand-maintained SDL extension carrying `Mutation.submitOrder` and
its input/response types, which DBC removed from every profile we can
introspect. `react/` still ships the mutation
(`react/src/apps/material/openOrder.graphql`, called from
`ReservationModalBody.tsx` for interlibrary loans), so `react/` codegens
against both files while `go/` and `cms/` read only the upstream one.

Be clear about what that buys: it keeps react's codegen green, it does
**not** make the mutation work. Upstream's whole `Mutation` type is now
`elba: ElbaServices!`, whose only field is `placeCopyRequest` (article
copies, not material orders) — so the replacement is not another profile,
it is another service. If `submitOrder` is really gone from the gateway,
that reservation flow is already failing at runtime, and vendoring the
types here changes nothing either way. **Finding out where order
submission is supposed to live now is the open task.** Once it is
answered, delete the extension file and the `openOrder` document with it.

## A note on the `Retriever*` definitions

`a0cde7ec2` added the `Retriever*` SDL (the `AccessUnion` member,
`Query.retriever`, and the `RetrieverArticle` / `RetrieverResponse` /
`RetrieverErrorEnum` / `RetrieverService` types) **by hand** to the FBI
snapshots, as a 153-line additive patch, because upstream did not serve
it yet.

That is no longer a patch to maintain. Every profile now serves all of it
natively, and byte-identically to the hand-written SDL. Refreshing does
**not** lose the Retriever types, and nothing needs re-applying
afterwards. Do not treat these definitions as local edits.

## Refresh

These tasks live in `schemas/Taskfile.yml`, which the repo-root
`Taskfile.yml` does **not** include — run them from this directory.
There is no `schemas:` prefix.

| Spec | Upstream                                                                                                                                                | Refresh |
|---|---------------------------------------------------------------------------------------------------------------------------------------------------------|---|
| `graphql/dbc-fbi.graphql` | DBC FBI gateway @ `fbi-api.dbc.dk/fbcms-go` — consumed by `react/`, `go/`, `cms/` (via Sailor in the cli container) and `packages/service-layer/` | `task refresh:dbc-fbi` |
| `graphql/dbc-fbi.local-submit-order.graphql` | None — hand-maintained, see above                                                                                     | Never refresh |
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
- **Replace react's `openOrder`/`submitOrder`** — see the FBI section
  above. This is the only thing keeping a hand-maintained SDL extension in
  this directory.
- Move SOAP parts to `/schemas` also. (`/go/lib/soap`)
- Consider more strict GH Action triggers, rather than broad (e.g. `/go/**`)
