# Service-layer adapters call their API by hand, not through the generated client

## Context

Per [ADR-001](adr-001-shared-api-contracts.md) each service-layer adapter
(`packages/service-layer/fbs/`, `biblio/`) generates a typed client from the
shared contract in `/schemas` with Orval. Yet every adapter's `client.ts`
builds its own requests and validates its own responses, and nothing imports
the generated client at runtime.

That looks like duplicated effort, and it is the first thing a reader of an
adapter asks about. This ADR is the answer.

## Decision

The generated client stays as the typed reference for the contract. It is
not used to call the API. Instead each adapter hand-writes two things:

- **Transport.** A `create<X>Client(config)` factory holding a small
  `request` helper that applies the auth header, builds the URL and query,
  and turns HTTP status into the adapter's error semantics.
- **Validation.** Zod schemas in `mappers/`, which parse the response and map
  it to the camelCase domain types in `src/types.ts`.

## Consequences

Three constraints made this the cheaper option:

1. **The generated client cannot be configured per instance.** It builds
   relative URLs, which a server-side `fetch` cannot use, and its only
   injection point is a module-global mutator. The service layer is consumed
   by two hosts at once — `go/` calls it server-side with a per-request user
   token, `react/` calls it from the browser with a base url from the mount
   contract — so a module-global cannot carry the config either of them
   needs. (The same mutator pattern *does* work for `react/`'s own Orval
   clients, where the wiring genuinely is module-global.)
2. **Generated types are compile-time only.** Response data is `unknown` at
   runtime. As the anti-corruption boundary, the service layer has to check
   what actually arrived before handing it on.
3. **The contract is not always authoritative.** The Biblio contract is
   hand-extracted from provider documentation rather than served by the
   provider, so responses can legitimately deviate from it.

What we pay for it:

- The transport re-implements URL and query building that Orval also
  generates.
- Hand-written schemas can drift from the contract. Drift surfaces in mapper
  tests and at runtime, not at compile time.
- Consumers gain the decoupling in exchange: upstream renames and added
  fields stop at the mapper, because unknown fields are stripped.

## Alternatives considered

- **Call the API through the generated client.** Rejected on constraints 1
  and 2: relative URLs break server-side, the module-global mutator cannot
  carry per-instance config, and it validates nothing.
- **Generate the zod schemas with Orval (`client: "zod"`).** Viable — it was
  evaluated against the Biblio contract and the output works. It is not
  adopted here because generated schemas enforce the contract's *required*
  fields, which is the wrong trade-off while constraint 3 holds, and because
  the choice belongs to the whole service layer rather than to the change
  that introduced one adapter. Worth revisiting once the Biblio contract is
  served by the provider.
