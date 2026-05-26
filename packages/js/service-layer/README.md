# @dpl/service-layer

An abstraction between the monorepo apps (GO, CMS/React) and external APIs.

The service layer exposes **composed functions** that return domain data. Consumers don't know — or care — which upstream API a function reads from. When an external API changes (e.g., FBS 1.0 to 2.0), or when a function starts pulling data from multiple sources, only the service-layer internals change. Consumers stay the same.

## Architecture

```
packages/js/service-layer/
  package.json                # @dpl/service-layer (one public entry: .)
  tsconfig.json
  vitest.config.ts
  src/                        # public composed layer
    index.ts                  # public exports (the only surface consumers touch)
    types.ts                  # domain DTOs (PatronInfo, AuthenticatedPatronInfo, ...)
    patron.ts                 # composed functions (getPatron, ...)
  fbs/                        # internal adapter for FBS
    orval.config.ts
    src/
      fbs-adapter.yaml        # OpenAPI spec (source of truth)
      generated/              # Orval output (internal, never exported)
      mappers/                # Raw FBS -> domain DTOs
      client.ts               # createFbsClient — internal
      types.ts                # FbsConfig — internal
      index.ts                # internal entry for the adapter
```

The `fbs/` folder is an **internal adapter**. There is no public `./fbs` subpath — consumers cannot import from it.

## Design principles

- **Composed functions own the public API.** Each exported function (e.g., `getPatron`) returns a domain DTO. The name says what data you get, not which API it came from.
- **Adapters are internal.** Per-service folders (`fbs/`, later `publizon/`) hold OpenAPI specs, generated types, mappers, and clients. None of this leaks out of the package.
- **Generated API types stay internal.** Only hand-written domain DTOs (in `src/types.ts`) are public.
- **Domain DTOs are minimal.** Only fields actually used by consumers. This decouples consumers from the full API schema.
- **Config is injected per call** as a service-namespaced object, so each composed function declares exactly which upstreams it needs:
  ```ts
  getPatron({ fbs: {...} })
  // future:
  getAllLoans({ fbs: {...}, publizon: {...} })
  ```
- **When an API version changes, only the mapper changes.** Domain DTOs and consumer code remain stable.

## Available scripts

```bash
yarn codegen:fbs    # Generate FBS types from OpenAPI spec
yarn test           # Run all tests
yarn test:watch     # Run tests in watch mode
yarn typecheck      # Run TypeScript type checking
```

## How consuming apps import

Apps depend on this package via a `file:` reference in their `package.json`:

```json
{
  "dependencies": {
    "@dpl/service-layer": "file:../packages/js/service-layer"
  }
}
```

For Next.js apps, also add to `next.config.mjs`:

```js
transpilePackages: ["@dpl/service-layer"]
```

Then call composed functions:

```typescript
import { getPatron } from "@dpl/service-layer"

const patron = await getPatron({
  fbs: {
    baseUrl: "https://fbs-openplatform.dbc.dk",
    getAuthHeader: () => `Bearer ${token}`,
  },
})
```

## How to add a new composed function

1. Decide which adapter(s) it needs.
2. Write/extend the relevant adapter client(s) under `<adapter>/src/client.ts` and mapper(s) under `<adapter>/src/mappers/`. Each mapper file exports a single `parseAndMap…(raw: unknown)` function that runs a co-located zod schema and returns the domain DTO. The client calls that function after the `response.ok` check.
3. Define or extend the domain DTO in `src/types.ts`. Domain DTOs are strictly minimal — a field only lives here if a consumer reads it. The PR that adds a field must also add the call site that reads it.
4. Add the composed function in `src/<domain>.ts` (or a new file). Its config parameter declares only the adapters it uses.
5. Re-export from `src/index.ts`.
6. Tests:
   - Mapper + schema: pass raw shapes through `parseAndMap…` and assert the mapped DTO; cover the "bogus shape throws" case.
   - Client method: mock `fetch` and cover happy path, non-2xx, shape mismatch, and both sync and async auth-header callbacks.
   - Composed functions get their own tests only when they actually compose (i.e. read from more than one adapter). Pass-throughs are covered by the client + mapper tests.

## How to add a new upstream adapter (e.g., publizon)

1. Create `publizon/` next to `fbs/` with the same shape (`orval.config.ts` + `src/{client,types,mappers,generated}.ts`, `src/<api>-adapter.yaml`).
2. Run codegen for the new adapter (add a `codegen:publizon` script).
3. Domain DTOs go in the package-level `src/types.ts`, not the adapter.
4. Compose data in `src/<domain>.ts` — combine `fbs` and `publizon` as needed.

## Node version

This package requires Node 24+. See `.nvmrc`.
