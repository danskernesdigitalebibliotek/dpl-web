# AGENTS.md — react

Context for working in `dpl-react` — a library of **standalone React apps**
that are bundled per-app and embedded inside the Drupal CMS.

Read [the root `AGENTS.md`](../AGENTS.md) first if you haven't.

## What this is, in one paragraph

These are not pages. They are small **apps** (search-result, reservation,
loan-list, …) that the CMS drops onto its pages via
`<div data-dpl-app="…">` containers. Each app is its own webpack entry
(`src/apps/<name>/<name>.mount.ts`) and gets its own JS/CSS artifact in
`dist/`. The CMS loads the artifact and a shared bundle, then the
`mount.js` runtime finds the `[data-dpl-app]` divs, looks up the registered
component, wraps it in a Redux + react-query + ErrorBoundary shell, and
renders. Storybook is the **only** local dev surface — there is no
standalone page.

## The mount contract

A few things follow from "your component is rendered inside someone else's
HTML page":

- **Data flows in via HTML attributes**, not props. Three suffix conventions
  carry it: `*Text`, `*Config`, `*Url`. The entry component composes
  `withText / withConfig / withUrls` HOCs which sniff those suffixes,
  dispatch them into Redux, and then components read via `useText("fooText")`
  / `useConfig("barConfig")` / `useUrls()`. **Never thread these by hand.**
- **Adding a new text key needs CMS work too.** The default value is shipped
  by `hook_dpl_react_apps_data()` in the CMS; if it's missing,
  `useText("fooText")` throws at runtime. See the matching gotcha in
  [`../cms/AGENTS.md`](../cms/AGENTS.md).
- **Don't render `<main>` inside an app** — the CMS provides the page's
  `<main>`. Use `<section>`. ESLint blocks this.
- **`bundle.js` is shared across all apps**, so a fat dep added to one app
  inflates every page that loads any DPL app. Reuse before adding.

## The state boundary

Keep these straight:

- **Redux Toolkit + redux-persist** holds *app/UI* state (text, config, url,
  modal stack, filter, persisted guarded auth requests). Storage key is
  `dpl-react` in sessionStorage.
- **react-query (v3, not TanStack v5!)** holds *all server data* — GraphQL
  and REST.
- **`nuqs`** for URL-synced state in newer apps. Don't repurpose the legacy
  `url` Redux slice for new URL state.

Server data never goes into Redux; app config never goes into react-query.

## Codegen is the wire

Server clients are generated — GraphQL via `graphql-codegen` (DBC Gateway),
REST via Orval (FBS, Publizon, dpl-cms, material-list). The generated files
under `src/core/{dbc-gateway,fbs,publizon,dpl-cms,material-list-api}/`
**must not be hand-edited**. Edit the source spec (`*.graphql` file,
`*-adapter.yaml`, or the sibling CMS's `openapi.json`) and regenerate.

Each generated client has a hand-written `mutator/fetcher.ts` alongside the
generated code — those are yours to edit. They inject the `Authorization`
header from sessionStorage tokens (`src/core/token.ts`), so don't set
`Authorization` manually when calling a generated hook.

## Where to learn more

- [`../docs/react/`](../docs/react/) — code guidelines, error handling,
  text handling, skeletons, wiremock mocking how-to, …
- [`../docs/react/architecture/`](../docs/react/architecture/) — ADRs.
- `package.json`, `webpack.config.js`, `eslint.config.mjs`, `.stylelintrc`,
  `dbc-gateway.codegen.yml`, `orval.config.ts` — sources of truth.
- `Taskfile.yml` — dev/CI commands. Storybook is the dev server.

## Gotchas worth knowing up front

- **react-query is v3.** Imports come from `react-query`, not
  `@tanstack/react-query`. Don't "fix" the import path.
- **App SCSS lives next to the app** and is found by a PostCSS glob.
  **Shared component SCSS must be `@use`-d in `components/components.scss`**
  — that aggregator is the only file PostCSS processes for components. A
  new component SCSS missing from there will silently not ship to `dist/`.
- **Service base URLs are data-attribute props, not env vars.** A Redux
  middleware extracts `<service>BaseUrl` from config dispatches; fetchers
  read them via `getServiceBaseUrl(...)`. Don't introduce `process.env`
  reads in a fetcher.
- **Error boundary uses a portal** whose container id comes from
  `errorMessagesConfig`. If the host hasn't supplied that config, errors
  fail silently — by design. Storybook default args provide one.
- **BEM with `dpl-` prefix.** CSS-only classes and JS selectors don't
  overlap — use `data-cy` or `js-foo` for behaviour.
