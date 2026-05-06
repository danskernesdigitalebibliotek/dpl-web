# library-service

Standalone package that holds thin wrappers around third-party library/book services. Each service lives in its own namespaced subfolder so consumers can tell at a glance which vendor they are talking to, and so adding a new service is a purely additive change.

Today the package contains:

- `wedobooks` — wrapper around [`@wedobooks/sdk`](https://wdb-web-sdk-docs.web.app/) for opening the e-book Reader and the audiobook Player bar.

Future services (e.g. `fbs`, `publizon`, or any new SDK) slot in as additional subfolders under `src/`.

The package knows nothing about any consuming app — each consumer decides how it sources configuration and where it renders UI.

## Public API

Each service is exported as a namespace under the package root:

```ts
import { wedobooks } from "library-service"

const sdk = wedobooks.createLibraryService(config)
wedobooks.openReader({ sdk, checkout, element })
wedobooks.openPlayerBar({ sdk, checkout, element })
const audio = await wedobooks.getAudioPlayer({ sdk, audioElement, checkout })
```

Types are available on the same namespace:

```ts
import type { wedobooks } from "library-service"

const config: wedobooks.LibraryServiceConfig = { /* ... */ }
```

### `wedobooks`

- `createLibraryService(config)` — constructs and caches a `WdbLibrarySdk`. Browser-only; throws on the server.
- `openReader({ sdk, checkout, element, callbacks })` — opens the reader into the element. `callbacks` must include `onClose` and `onFinishBookClick`.
- `openPlayerBar({ sdk, checkout, element, callbacks })` — opens the audio player bar into the element. `callbacks` must include `onClose`.
- `getAudioPlayer({ sdk, audioElement, checkout })` — returns a configured audio player bound to the given `<audio>` element.

`wedobooks.LibraryServiceConfig`:

```ts
{
  applicationId: string
  firebaseApiKey: string
  firebaseProjectId: string
  firebaseAppId: string
  readerApiKey: string
  styling?: { mode: "light" | "dark" }
}
```

## Adding a new service

1. Create `src/<service-name>/` with your own `client.ts`, `types.ts`, plus any operation files.
2. Add a `src/<service-name>/index.ts` barrel re-exporting the public surface.
3. Add one line to `src/index.ts`: `export * as <service-name> from "./<service-name>"`.
4. If the service depends on a new third-party package, add it to `dependencies` in `package.json` (and ensure the registry / auth token is documented).

## Setup

This package installs `@wedobooks/sdk` from the private WeDoBooks npm registry. A `WEDOBOOKS_NPM_TOKEN` env var must be set before running `yarn install`.

```sh
export WEDOBOOKS_NPM_TOKEN=...
yarn install
yarn build
```

## Consuming from another package in this repo

Add to the consumer's `package.json`:

```json
"library-service": "file:../library-service"
```

`@wedobooks/sdk` (and its `@colibrio/*` transitive deps) are **bundled into `dist/`** by `tsup`, so consumers do **not** need a WeDoBooks `.npmrc` or the `WEDOBOOKS_NPM_TOKEN` env var to install. Only this package does.

Workflow when `library-service`'s source changes:

1. `cd library-service && yarn build` (requires `WEDOBOOKS_NPM_TOKEN` in the shell).
2. `cd ../<consumer> && yarn install` — Yarn copies the refreshed `dist/` into the consumer's `node_modules/library-service/`.

`yarn build:watch` in one terminal + `yarn install` in the consumer when you want to pick up changes.

## Scripts

- `yarn build` — compile `src/` → `dist/` with type declarations.
- `yarn build:watch` — incremental build.
- `yarn typecheck` — type-only check.
- `yarn clean` — remove `dist/`.
