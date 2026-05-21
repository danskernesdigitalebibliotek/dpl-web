# Service Layer

An abstraction between the monorepo apps (GO, CMS/React) and external APIs.

The service layer defines its own types, maps API responses to those types, and shields consumers from API version changes. When an external API changes (e.g., FBS 1.0 to 2.0), only the service layer internals need updating — consumers remain unaffected.

## Architecture

Each external service gets its own folder under the package root, exposed as a subpath export:

```
packages/js/service-layer/
  package.json                # @dpl/service-layer (subpath exports per service)
  tsconfig.json
  vitest.config.ts
  fbs/                        # ./fbs subpath
    orval.config.ts
    src/
      fbs-adapter.yaml        # OpenAPI spec (source of truth)
      generated/              # Orval output (internal, never exported)
        model/
      mappers/                # Transforms raw API types -> service layer types
        patron.mapper.ts
        patron.mapper.test.ts
      client.ts               # Client factory with injectable config
      types.ts                # Hand-written types consumers see
      index.ts                # Public exports for this service
```

## Design principles

- **Generated API types stay internal** — they are never exported to consumers. Only hand-written service layer types are public.
- **Service layer types are minimal** — only include fields actually used by consumers. This decouples consumers from the full API schema.
- **Client factories accept injectable config** — each consuming app provides its own base URL and auth strategy. This allows the GO app to proxy through its API routes while the React app can call APIs directly.
- **When an API version changes, only the mapper changes** — the service layer types and consumer code remain stable.

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

Then import in your code:

```typescript
import { createFbsClient } from "@dpl/service-layer/fbs"

const client = createFbsClient({
  baseUrl: "https://fbs-openplatform.dbc.dk",
  getAuthHeader: () => `Bearer ${token}`,
})

const patronInfo = await client.getPatronInfo()
```

## How to add a new service

1. Create a new folder (e.g., `publizon/`) with the same `orval.config.ts` + `src/` shape
2. Add the API spec file under `src/`
3. Run codegen to generate raw types into `src/generated/`
4. Define hand-written service layer types in `src/types.ts`
5. Write mappers in `src/mappers/` that transform generated types to service layer types
6. Write the client factory in `src/client.ts`
7. Export the public API from `src/index.ts`
8. Add the new subpath to `exports` in `package.json` and a `codegen:<service>` script

## How to add a new endpoint to an existing service

1. Define any new service layer types needed in `src/types.ts`
2. Write a mapper in `src/mappers/` for the new endpoint's response
3. Add a method to the client factory in `src/client.ts`
4. Export new types from `src/index.ts` if needed
5. Write tests for the mapper

## Node version

This package requires Node 24+. See `.nvmrc`.
