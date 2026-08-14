# Hand-written client and validation boundary in service-layer adapters

## Context

The service layer (`packages/service-layer/`) sits between the monorepo apps
and external APIs. Its adapters (`fbs/`, `biblio/`) are consumed by two very
different hosts: `go/` calls them server-side with per-request user tokens,
and `react/` calls them from the browser where the base url and tokens come
from the app mount contract (data attributes and sessionStorage).

Per [ADR-001](adr-001-shared-api-contracts.md) each adapter generates a typed
client from the shared contract in `/schemas` with Orval. This raises a fair
question whenever someone reads an adapter: why does `client.ts` hand-write
requests and response validation when a generated client exists?

Three constraints shape the answer:

1. **Per-instance configuration.** Orval's generated fetch client builds
   relative URLs (unusable in a server-side `fetch`) and its only injection
   point is a module-global mutator. A module-global cannot carry the
   per-instance config (`baseUrl` + `getAuthHeader`) that `go` needs per
   request and `react` wires up from the mount contract. This is exactly why
   the mutator pattern works for `react/`'s own Orval clients (there the
   wiring *is* module-global) but not for a package shared by both hosts.
2. **Runtime validation.** Generated types are compile-time only — response
   data is `unknown` at runtime. The service layer is the anti-corruption
   boundary, so it must actually check what arrives before handing it to
   consumers.
3. **Contract fidelity is not guaranteed.** Some upstream contracts (e.g.
   the Biblio adapter) are hand-extracted from provider documentation rather
   than served by the provider, so responses may deviate from the contract.

## Decision

Service-layer adapters keep a hand-written boundary:

- Each adapter exposes a `create<X>Client(config)` factory. The transport
  (auth header, URL and query building, error semantics) is a thin
  hand-written `request` helper.
- Responses are validated with hand-written **lean** zod schemas in
  `mappers/` which only validate the fields consumers actually use, and are
  then mapped to camelCase domain DTOs in `src/types.ts`. Unknown fields are
  stripped, so additive upstream changes do not break parsing.
- The Orval-generated client stays in `generated/` as the typed contract
  reference but is not imported at runtime.

## Consequences

- Both hosts can use the same adapter with their own config; nothing in the
  package depends on module-global state.
- Consumers are decoupled from wire formats: upstream renames and additions
  stop at the mapper.
- The transport plumbing duplicates logic Orval also generates (URL and
  query building), and hand-written schemas can drift from the contract.
  Drift is caught by mapper tests and at runtime — not at compile time.
- The generated client is dead weight at runtime and exists purely as
  reference documentation of the full contract.

## Alternatives considered

- **Use the generated fetch client directly.** Rejected: relative URLs break
  server-side, the module-global mutator cannot carry per-instance config,
  and it performs no runtime validation.
- **Generate the zod schemas with Orval (`client: "zod"`).** Evaluated
  against the Biblio contract (Orval 7.21, zod 4): the output type-checks,
  enums, `anyOf` unions and complex schema keys generate correctly, and
  unknown fields are stripped just like our hand-written schemas. The
  trade-off is that generated schemas are contract-strict about *required*
  fields, where our lean schemas only validate what we consume — stronger
  enforcement, but brittle when a hand-extracted contract deviates from
  reality (see constraint 3). Adopting this would remove the schema-drift
  risk and should be decided for the whole service layer (`fbs/` and
  `biblio/` together) in a future ADR; it was deliberately not bundled into
  the change that introduced the Biblio adapter.
