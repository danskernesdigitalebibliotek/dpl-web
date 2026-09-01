# Service Layer

## Context

FBS calls were scattered across components, hooks, and server actions. Wire
shapes leaked into UI, query keys were duplicated between SSR and client,
mocks were brittle, and FBS failure codes flowed as raw strings.

## Decision

Workspace package `@danskernesdigitalebibliotek/dpl-service-layer`,
platform-agnostic, linked from `go/` via `file:../packages/service-layer`.

Three layers:

1. **Imperative fns** — `getPatron`, `getMaterialAvailability`,
   `getReservations`, `createReservation`, `deleteReservation`. Take a
   `ServiceLayerConfig`, return mapped domain results. Used by SSR prefetch
   and tests.
2. **Query factories** — `patronQuery`, `materialAvailabilityQuery`,
   `reservationsQuery`. Return React Query `queryOptions`. Used by
   `prefetchQuery` on the server and by hooks on the client. Query keys
   colocated.
3. **React hooks** — `usePatron`, `useMaterialAvailability`,
   `useReservations`, `useCreateReservation`, `useDeleteReservation`. Read
   `ServiceLayerConfig` from context.

Hosts implement `ServiceLayerConfig`:

```ts
type ServiceLayerConfig = {
  getBaseUrl: (api: ApiId) => string;
  getAuthHeader: (api: ApiId) => Promise<string> | string;
};
```

Mappers (Zod-validated) own wire→domain translation. Failure modes split:
FBS protocol failures return `{ status: "failed", reason }`; transport/parse
errors throw.

Deps: `zod`. Peers: `@tanstack/react-query`, `react`.

## Consequences

### Positive

- Single source of truth for FBS shapes.
- One `queryFn` shared between SSR prefetch and client `useQuery`.
- Exhaustive `FailureReason` literal union — compile-time checks at the UI.
- Hosts stub `ServiceLayerConfig` in tests/storybook without HTTP mocks.

### Negative

- Extra workspace package and indirection (component → hook → query → fn → fbs).

### Costs of shipping hooks from a workspace package

- **Duplicate React Query.** `yarn add file:../packages/service-layer`
  re-installs `@tanstack/react-query` under the package's own `node_modules`,
  so hooks run against a different `QueryClient` than the host's
  `QueryClientProvider` ("No QueryClient set"). Workaround: `rm -rf` the
  nested copy after every install. pnpm workspaces would hoist shared peers
  and remove this class of bug.
- **No semver via `file:`.** Every package edit requires a re-link in `go/`;
  the lockfile churns and CI repeats the step. pnpm workspaces (`workspace:*`)
  replace the link with a real workspace dependency.
- **Dual auth path.** `getAuthHeader` is `Promise<string> | string` so the
  same hook works under SSR (sync, pre-resolved token) and under a client
  using a server action (async roundtrip).
- **Provider required.** `useServiceLayerConfig` throws if no
  `ServiceLayerProvider` is mounted. Missing provider is a runtime stack
  trace, not a type error.

### Alternatives considered

- Orval hooks directly — leaks wire types, no domain mapping.
- Keep in `go/lib/` — couples to Next.js, blocks reuse.
- Inline `queryFn` at call sites — duplicates keys and mappers.

## Improvements

- Adopt pnpm workspaces to share peer deps and drop the `file:` link
  (see PR #992).
