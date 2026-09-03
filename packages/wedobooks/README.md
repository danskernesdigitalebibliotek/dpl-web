# @danskernesdigitalebibliotek/dpl-wedobooks

The ebook reader and the audiobook player, wrapped around
[`@wedobooks/sdk`](https://wdb-web-sdk-docs.web.app/).

A digital material borrowed through the Biblio adapter is opened here. Loans
made through Publizon are not — they keep pubhub's reader and player, because
that is where those entitlements live. Which one opens a given loan is decided
from the loan itself, never from the library's current provider.

## Why this package exists

Three reasons, none of them cosmetic:

- **The SDK cannot be consumed by webpack as published.** Colibrio, the reading
  framework underneath it, ships UMD modules whose AMD branches webpack picks
  up through static analysis and then fails to resolve. `build.mjs` pre-bundles
  everything with esbuild and neutralises those branches. The AMD half of that
  could in principle be handled in webpack instead (`module.parser.javascript.amd:
  false`, or `noParse`), but the node polyfills the SDK needs would still have to
  be configured per consumer - and pre-bundling covers Storybook and any future
  GO consumer for free.
- **It only exists in the browser.** Constructing the client initialises
  Firebase and touches `window`. Keeping that behind one factory means one
  guard rather than one per caller.
- **It is big** — roughly 4.6 MB minified. Consumers must import it lazily so
  it stays out of bundles that no one reading a book will load. `react/`
  does this with `React.lazy` plus a webpack cache group; see
  `react/webpack.config.js`.

## Access

The SDK is published to WeDoBooks' own registry, not to npm, and so is their
mirror of Colibrio. `.npmrc` at the repository root maps both scopes; the
credential is the one part that stays out of the repository - set it once in
the user-level npm config:

```sh
pnpm config set "//npm.pkg.wedobooks.io/:_authToken" "$WEDOBOOKS_NPM_TOKEN"
```

In CI the same line runs from `.github/actions/common-setup-js`, fed by the
`WEDOBOOKS_NPM_TOKEN` repository secret. The Lagoon images take it as a build
argument of the same name, used only in the throwaway build stage.

## Build

Unlike the other workspace packages, this one ships a build rather than
sources, so it has to be built before anything can import it:

```sh
pnpm --filter @danskernesdigitalebibliotek/dpl-wedobooks build
```

`dist/` is not committed.

## Runtime configuration

`createWedoBooksSdk` needs five values provisioned by WeDoBooks. They reach the
browser, and none of them is a secret: which patron is reading is settled by a
short-lived sign-in token from the Biblio adapter, not by these.

The CMS serves them from the `WEDOBOOKS_*` environment variables and leaves
them out entirely unless all five are set, so React can tell an unconfigured
site from a misconfigured one.

## Signing in

The SDK keeps its own session against WeDoBooks rather than going through the
adapter, so opening a book takes two steps:

1. Ask the adapter to vouch for the patron we already authenticated —
   `POST /v1/auth/create-sign-in-token`, exposed as `readerSignInTokenQuery`.
2. Hand the resulting token to `signInWedoBooksUser`.

The SDK reports a refused sign-in as a resolved result rather than a rejection,
so callers read `success` instead of relying on a throw.

## Using it from GO (or anything that server-renders)

**The package cannot be imported on the server.** `history@4`, reached through
the SDK's `react-router-dom@5`, builds a browser history at module scope, so
merely evaluating the module throws `Browser history needs a DOM`. Verified by
requiring `dist/index.js` under plain node.

That is harmless in `react/`, where apps are mounted in the browser by Drupal
and every reference here is a dynamic `import()` inside `React.lazy`. It is not
harmless in Next.js: a `"use client"` component is still evaluated on the server
to produce the initial HTML. A GO consumer therefore has to reach the package
through `next/dynamic` with `ssr: false`, never a static import.

Two more things a GO integration will need, neither of which exists yet:

- **The orchestration lives in `react/`, not here.** `useReaderSdk`,
  `useReaderCheckout` and `useReaderSdkConfig` sit in
  `react/src/core/digital/`, and the config hook reads React's Redux store. Only
  that last part is host-specific; the chain from config to signed-in session to
  entitlement is generic. Moving it here - taking the config and the token
  getter as inputs, the way `ServiceLayerConfig` already does for the adapter -
  is what makes a second host possible without copying it.
- **The build emits CommonJS.** Fine for webpack, worth revisiting for Next.

## Known gaps

- **A loan cannot be handed back early.** The SDK stopped ending the
  entitlement when a book is finished, leaving it to the integration — but
  neither the SDK nor the Biblio adapter exposes a way to return a
  loan, so it runs to its expiry either way. Open with DBC.
- **The SDK declares `lodash-es` but imports `lodash`.** A packaging bug on
  their side; `lodash` is pinned here so esbuild can resolve it. Drop it once
  they fix theirs.
- **Its React peer range stops below 19, and we run 19.** The manifest here
  widens it deliberately. What has been checked is that there is only one React
  instance - the SDK bundles none of its own - so the failure mode is not two
  Reacts. What has *not* been ruled out is the SDK's own dependencies (MUI 6,
  `styled-components` 5, `react-router-dom` 5) relying on APIs React 19 removed,
  such as `findDOMNode` or string refs. Watch for it when exercising the reader,
  and raise it with WeDoBooks if their range does not move.
