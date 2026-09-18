# schemas/

> ## ⚠️ `dbc-fbi.temp-next.graphql` is frozen — do not refresh it
>
> Upstream has removed the `submitOrder` mutation from every profile we
> can introspect, while `react/` still ships the `openOrder` mutation that
> reservations depend on (`react/src/apps/material/openOrder.graphql`
> selects `submitOrder(input:, dryRun: false)`, and `react/` codegens
> against this file — see `react/dbc-gateway.codegen.yml`).
>
> `dbc-fbi.temp-next.graphql` is therefore **a fossil, not a snapshot**:
> it no longer corresponds to any live endpoint. It is the last
> introspection that still contains `SubmitOrder`, kept checked in purely
> so react codegen keeps compiling. **Do not run
> `task refresh:dbc-fbi:temp-next`** — it will drop `submitOrder` and
> break that codegen.
>
> Note what this does *not* buy you: vendoring a stale schema keeps
> codegen green, it does not keep the mutation working at runtime. If
> `submitOrder` is really gone from the gateway, the open-order
> reservation flow is already broken against live upstream. Finding out
> where order submission is supposed to live now is the actual open
> task — see below.

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

   **See the banner above** — `dbc-fbi.temp-next.graphql` is frozen and
   must not be refreshed while `react/` depends on `submitOrder`.
5. **CMS-produced artifacts stay in `cms/`.** `cms/openapi.json` (REST
   surface) and `cms/dpl-cms.bnf.graphql` (BNF GraphQL SDL,
   snapshotted via Sailor) are artifacts produced by the Drupal CMS
   itself, not upstream contracts — they live next to the code that
   generates them. `go/` codegen reads them from `cms/` directly.

## Getting rid of `temp.fbi-api.dbc.dk` (and the two-file split)

**There is no longer any reason to use the `temp.` host.** Findings from
2026-09-15, all verified by direct introspection:

- **The three profiles are byte-identical.** `fbi-api.dbc.dk/next`,
  `fbi-api.dbc.dk/fbcms-go` and `temp.fbi-api.dbc.dk/next` introspected
  on the same day produce files `diff` reports as identical, in all three
  pairings. `temp.` serves nothing the prod host does not.
- **Production already uses the prod host.** react's runtime FBI URL
  comes from the CMS: `dpl_fbi.settings.yml` supplies
  `https://fbi-api.dbc.dk/[profile]/graphql` and
  `dpl_fbi/src/Fbi.php` (`FBI_PROFILE = 'next'`) fills it in. The `temp.`
  host survives only in build/dev config, never in a real request.
- **Exactly one react document is incompatible.** Running
  `graphql-inspector validate 'react/src/**/*.graphql'` against a current
  introspection reports one invalid document —
  `react/src/apps/material/openOrder.graphql` (`Cannot query field
  submitOrder on type Mutation`, `Unknown type SubmitOrderInput`).
  Everything else in react already validates against the live schema.
- **Order submission has left the gateway entirely.** The whole Mutation
  type is now `elba: ElbaServices!`, whose only field is
  `placeCopyRequest` (article copies, not material orders). So the
  replacement is not another profile — it is another service. That is the
  open question.

Once open-order is resolved, this collapses to a single snapshot: point
`react/dbc-gateway.codegen.yml`, `react/graphql.config.json` and the
storybook defaults in `react/src/core/storybook/serviceUrlArgs.ts` at the
prod profile, drop `DBC_FBI_TEMP_NEXT_URL` and the
`refresh:dbc-fbi:temp-next` task from `Taskfile.yml`, and delete
`dbc-fbi.temp-next.graphql`. Nothing else depends on the split.

## A note on the `Retriever*` definitions

`a0cde7ec2` added the `Retriever*` SDL (the `AccessUnion` member,
`Query.retriever`, and the `RetrieverArticle` / `RetrieverResponse` /
`RetrieverErrorEnum` / `RetrieverService` types) **by hand to both**
FBI snapshots, as a 153-line additive patch, because upstream did not
serve it yet.

That is no longer a patch to maintain. Every profile now serves all of it
natively, and byte-identically to the hand-written SDL — verified
2026-09-15. Refreshing either file does **not** lose the Retriever types,
and nothing needs re-applying afterwards. Do not treat these definitions
as local edits.

One thing to know before refreshing `dbc-fbi.fbcms-go.graphql`: it
currently pulls in a large amount of *unrelated* upstream drift (~1200
added / ~880 removed lines — new `MaterialSelection*`, `Publizon`,
`SoundRecording`, `GenreForm` types; removed `ManifestationPart(s)`,
`CreatorImage`, `TableOfContent`, `Wikidata`). No `.graphql` document in
`react/`, `go/` or `cms/` selects any of the removed types, but that
refresh is its own change — take it on its own branch and re-run the
consuming projects' codegen with it.

## Refresh

These tasks live in `schemas/Taskfile.yml`, which the repo-root
`Taskfile.yml` does **not** include — run them from this directory.
There is no `schemas:` prefix.

| Spec | Upstream                                                                                                                                                | Refresh |
|---|---------------------------------------------------------------------------------------------------------------------------------------------------------|---|
| `graphql/dbc-fbi.temp-next.graphql` | DBC FBI gateway @ `temp.fbi-api.dbc.dk/next` (⚠️ frozen, do not refresh — see banner) — consumed by `react/`                                      | `task refresh:dbc-fbi:temp-next` |
| `graphql/dbc-fbi.fbcms-go.graphql` | DBC FBI gateway @ `fbi-api.dbc.dk/fbcms-go` (prod host, profile matching go's runtime) — consumed by `go/`, `cms/` (via Sailor in the cli container) and `packages/service-layer/` | `task refresh:dbc-fbi:fbcms-go` |
| `openapi/material-list.yaml` | `danskernesdigitalebibliotek/ddb-material-list@develop`                                                                                                 | `task refresh:material-list` |
| `openapi/fbs-adapter.yaml` | FBS swagger 1.2 (Cicero), converted via [`itk-dev/dpl-fbs-adapter-tool`](https://github.com/itk-dev/dpl-fbs-adapter-tool)                               | `task refresh:fbs` (clones the tool into `.cache/`, runs its docker pipeline) |
| `openapi/publizon-adapter.yaml` | None — edit by hand                                                                                                                                     | `task refresh:publizon` *(stub that prints this)* |
| `openapi/biblio-adapter.yaml` | Biblio adapter (DBC) @ [`biblio-adapter.dbc.dk/docs`](https://biblio-adapter.dbc.dk/docs) — consumed by `packages/service-layer/`                                        | Manual: use the "Download OpenAPI specification" button on the docs page and convert the JSON to YAML |


All refresh/format tasks run in Docker — `schemas/` has no local
toolchain (no `node_modules`, no `npm install`). The DBC FBI refresh
tasks additionally need a bearer token: set `LIBRARY_TOKEN` in the central
root `.env` (see the repo-root `.env.1pass`, or run `task token:generate`
from the repo root) — `schemas/Taskfile.yml` loads it via
`dotenv: ['../.env']`.

```sh
task refresh          # rebuild schemas from respective sources
task format           # prettier-format the schemas (also run by :refresh)
```

Note that every `refresh:*` task chains `task: format`, which formats
**all** of `openapi/` and `graphql/` — not just the file being
refreshed. `openapi/biblio-adapter.yaml` is currently committed
unformatted, so any refresh will also reformat it (~880 lines, quote
style and indentation only). Commit that separately.

## Regenerate clients

Codegen is owned by each consuming project. After updating a contract
here, run the relevant `task codegen:*` tasks in the consuming project
(see each sub-project's `Taskfile.yml` — `task codegen` shows the
available codegen tasks).

## TO-DOs
- **Retire `temp.fbi-api.dbc.dk` and consolidate to one FBI snapshot** —
  blocked only on replacing react's `openOrder`/`submitOrder`. See the
  section above for the full findings and the exact files to change.
- Move SOAP parts to `/schemas` also. (`/go/lib/soap`)
- Consider more strict GH Action triggers, rather than broad (e.g. `/go/**`)
- Commit the prettier formatting of `openapi/biblio-adapter.yaml` on its
  own, so it stops riding along with unrelated refreshes.
- `go/codegen.ts` still refers to `task schemas:refresh:dbc-fbi:fbcms-go`
  in a comment; that prefix does not exist.
