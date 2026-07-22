# ADR 014: nuqs is the default for URL query state

## Context

The apps use URL query parameters to carry state across page loads and
redirects (the `modal` stack, material `type`, loan list `listview`, the
`didAuthenticate` login marker, search `facets`, advanced search CQL, …).

[ADR 013](./adr-013-url-query-parameter-encoding.md) made `URLSearchParams`
the single encode/decode authority and added `prettifyQueryColons()` to keep
colons readable when we wrote to the address bar via the hand-rolled helpers
`setQueryParametersInUrl` / `removeQueryParametersFromUrl` (which call
`window.history.replaceState` directly). Reading went through
`getUrlQueryParam`.

Two problems remained with the hand-rolled approach:

- **Side effects in the wrong place.** The modal stack was synced to the URL
  from inside a Redux reducer (`modal.slice`), and every writer had to
  remember to run `prettifyQueryColons`. URL state was not owned by the React
  layer that renders from it.
- **It is not the project's stated direction.** `nuqs` was already introduced
  for URL-synced state in the newer apps (advanced-search-v2, search-result's
  `facets`/`onShelf`), and `react/AGENTS.md` blesses it as the mechanism for
  URL-synced state. A PR review asked that we standardise on it rather than
  keep hand-rolling `URLSearchParams` + `window.history`.

`nuqs` is a hooks library: `useQueryState` must run inside React under a
`NuqsAdapter`. Its serializer (`encodeQueryValue`) leaves `:` and `,`
unescaped, so it produces readable colons on its own — the exact behaviour
`prettifyQueryColons` was hand-rolling.

## Decision

`nuqs` is the default mechanism for reading and writing URL query state in
`dpl-react`. New URL state MUST use `useQueryState` / `useQueryStates`.

- **One adapter for everyone.** `NuqsAdapter` wraps the shared `Store`
  (`components/store.tsx`), so every mounted app — and Storybook — has it,
  the same way `QueryClientProvider` is provided once. Per-app adapters were
  removed.
- **The modal stack syncs via a hook, not the reducer.** `modal.slice` no
  longer touches the URL (the pre-existing scroll-lock and focus-restore side
  effects remain in the reducers); `useModalUrl` — mounted exactly once per
  React root via `<ModalUrlSync />` inside `Store`, since URL↔stack sync is a
  singleton concern, not a per-`Modal` one — keeps stack and URL in **two-way
  sync**: URL changes the stack did not make (initial load, back/forward, the
  login-redirect reopen flow) reconcile the stack by opening/closing modals,
  and stack changes mirror into the `modal` parameter (open pushes a history
  entry, close replaces). The stack serialises as a comma-separated list
  (`?modal=a,b`); modal ids are hyphen-joined and never contain commas, so
  the separator is safe, and a single modal — including the login-redirect
  reopen flow — is byte-for-byte the same URL as before (`?modal=x`).
- **Genuine URL-state writes migrated to nuqs.** `type` (material,
  availability-label) and `didAuthenticate` (guarded-app) now go through
  `useQueryState`; `listview` (loan list) goes further — the URL is the
  single source of truth for the view, so reloads and shared links land on
  the chosen view. `prettifyQueryColons` is no longer needed for these —
  nuqs keeps colons readable natively. Param keys with several call sites
  are single-sourced (`MATERIAL_TYPE_URL_PARAM` in `url.ts`).
- **Reads that cannot use hooks keep `getUrlQueryParam`.** Plain, non-hook
  functions (`getInitialSearchQuery`, `getDisclosureOpenStatesFromUrl`,
  `getParams`) still call `getUrlQueryParam` / `getQueryParams`, which stay
  in `url.ts`. Reading is not the write anti-pattern nuqs replaces. Readers
  of the `modal` parameter (loan-list, reservation-list) go through
  `getModalIdsFromUrl`, exported next to the parser in `useModalUrl.ts`, so
  the wire format has exactly one owner.
- **Legacy hand-rolled writers are quarantined, not deleted.** Two consumers
  are deliberately left untouched — advanced-search **v1** (kept only for CQL
  search) and search-result's `useFilterHandler` (a sentinel-flag scheme whose
  real state lives in persisted Redux, not the URL). Migrating either would be
  a rewrite, not a mechanical swap. `setQueryParametersInUrl`,
  `removeQueryParametersFromUrl`, `replaceCurrentLocation`, and
  `prettifyQueryColons` were moved out of the shared `url.ts` into a
  `@deprecated` `core/utils/helpers/legacy-url.ts`, to be deleted when those
  two are retired.

This supersedes ADR 013 for query *writing*: nuqs, not
`URLSearchParams` + `prettifyQueryColons`, is now the writing path for
everything except the quarantined legacy consumers. ADR 013's single-encode
rule still governs the surviving `getUrlQueryParam` readers and the legacy
writers.

## Alternatives considered

### Migrate everything, including advanced-search v1 and search-result

Would let us delete the legacy helpers outright. Rejected: v1 lingers only for
CQL and search-result's filter scheme is a persisted-Redux design, not real
URL state; both are rewrites with high regression risk across 100+ sites for
no user-facing gain. Quarantining isolates the cruft and marks it for deletion
without destabilising legacy.

### Wrap nuqs inside the `url.ts` helper functions

Not possible: nuqs is hook-based and the helpers are plain functions called
from reducers, event handlers, and module scope. The migration has to happen
in the consuming components, not behind a function facade.

### Keep the hand-rolled helpers as the default

Rejected per the review: it perpetuates side-effect-in-reducer URL writes and
the manual `prettifyQueryColons` dance, and diverges from the already-adopted
nuqs pattern.

## Consequences

- URL query state is owned by the React layer that renders it; adding new
  state is a `useQueryState` call with a typed parser, no manual history or
  colon handling.
- `prettifyQueryColons` survives only in `legacy-url.ts`; nuqs gives readable
  colons for the migrated parameters for free.
- nuqs live-syncs the *hook value* with the URL, so back/forward now updates
  migrated state: `didAuthenticate` is read reactively, `listview` derives
  the loan-list view straight from the URL, and the modal sync is two-way —
  opening a modal pushes a history entry and pressing Back closes it again
  (forward reopens it), where the old code left the modal open on a stale
  URL. The deliberate exception is material's `type`, which is read once
  when work data loads. One nuance: closing via Back dispatches `closeModal`
  directly and therefore bypasses a modal's optional `eventCallbacks.close`
  — the old code never closed on Back at all, so no behaviour was lost.
- Old bookmarks that stacked modals with repeated keys (`?modal=a&modal=b`)
  reopen only the first modal, since nuqs reads the comma-separated form.
  Single-modal links — the common case and the login flow — are unaffected.
- `NuqsTestingAdapter` is the test seam: `modal.test.tsx` and
  `toggle-list-view.test.tsx` pin the reopen-from-URL and write-to-URL
  behaviour.
