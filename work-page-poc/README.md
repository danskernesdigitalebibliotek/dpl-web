# Work-page proof of concept (DDF-794)

A place to try the designer's redesign ideas for the work page against real
materials. It lives on a pull request that is never merged
([#2324](https://github.com/danskernesdigitalebibliotek/dpl-web/pull/2324));
Lagoon gives that PR an environment, and this app is one more service in it:
<https://work-page-poc.pr-2324.dpl-web.dplplat02.dpl.reload.dk/>.

Open questions and untested scenarios are tracked in
[OPEN-QUESTIONS.md](OPEN-QUESTIONS.md).

## What it is

- A static Vite + React app. Pages: a plain FBI search (`/`) and the work page
  (`/work/:workId`, with `?manifestationId=` choosing the manifestation shown;
  without it, FBI's best representation).
- Catalogue data comes from the PoC's own FBI operations in
  `src/fbi/documents/`, generated into typed documents by `task codegen`.
- Library data (availability, and later reservations and loans) comes from
  `packages/service-layer`.
- Tokens are pasted into the connection dialog (the ⚙ button, bottom right)
  and kept in sessionStorage. A library token shows works and availability; a
  user token adds patron data.
- Tailwind v4 is available without Preflight, so the scaffold keeps the
  browser's default look until a concept brings its own styling.

## Running it

- `task dev` starts the dev server.
- `task build` typechecks and builds `dist/`.
- `task lagoon:build` builds the Lagoon image locally.

## Deployment

`docker-compose.lagoon.yml` has a `work-page-poc` service built from
`lagoon/Dockerfile`: a Node stage builds `dist/`, and Lagoon's nginx image
serves it with a fallback to `index.html` for client-side routes. The CMS and
GO still deploy alongside it, so a push takes as long as for any PR.

## Decisions

- **An extra service, not a stripped environment.** Adding one service to
  `docker-compose.lagoon.yml` keeps the diff to shared files small, so the
  branch rebases on `develop` cheaply.
- **A fresh app, not react/'s material app.** Mounting the existing app would
  bring its Redux shell, injected text/config/url props and markup, which work
  against a redesign.
- **Own FBI queries, service layer for the rest.** The work-page queries are
  what the redesign reshapes, so they live here rather than in the shared
  service layer. Availability, reservations, patron and digital loans are
  already solved there.
- **Static, with pasted tokens.** No server runtime; FBI and FBS accept
  browser requests, as react/'s Storybook relies on.
- **One page that evolves.** Ideas replace each other on `/work/:workId`
  rather than living side by side on separate routes.
- **Concepts keep their own styling.** They don't look like today's work page,
  so they read as a prototype without an imposed "no design" look.

## From designer artifact to page

1. Rebuild the artifact's markup and styling as components under `src/`,
   using Tailwind for its styles. Add Preflight to `src/styles.css` if the
   artifact assumes a CSS reset.
2. Replace its mock data: extend or add operations in `src/fbi/documents/`,
   run `task codegen`, and read them through a `useQuery` hook like `useWork`.
3. Use the service layer's hooks for anything library- or patron-specific.

## Concepts

- **Articles** (`src/work/categories/article/`), from the designer's
  "Materialeside – Udgavevælger" artifact: its mobile article boards below
  1024px and its "Flere formater · Udgavevælger · Desktop" board from there up. Access ways are ranked as the
  ticket orders them and skip links FBI reports as broken. "Bestil digital
  kopi" is simulated. With the `opac` FBI url, these show the artifact's cases:
  - Helsingør, dead link: `/work/work-of:870971-tsart:85962698`
  - Kolding, two editions: `/work/work-of:870971-tsart:73451485`
  - Varde, two posts: `/work/work-of:159007-lokalbibl:90222007`
  - Læs artikel and Se online: `/work/work-of:870971-tsart:136293443`
- Everything else falls back to the raw catch-rest page. A new concept is a
  new category in `src/work/categories/registry.ts`; [AGENTS.md](AGENTS.md)
  has the checklist.

## The debug panel

The "?" button opens a drawer that explains why the page looks as it does: the
category, the chosen manifestation, and for articles every FBI access entry
and what became of it, plus the category's general rules and the raw FBI data.
It renders the trace of the same functions the page renders from, and every
category must provide one, so it stays in step as categories are added.

## Gotchas

- **The FBI profile decides what data exists.** The url's path segment
  (`/next/`) is a profile, set up per library agency. A profile the token's
  agency lacks answers 200 with empty results. The default is `next`, expected
  to match the customer; our test tokens (agency 723000) need
  `https://fbi-api.dbc.dk/opac/graphql`, entered in the dialog.
- **Tokens are per tab.** sessionStorage doesn't carry over to a new tab, and a
  saved FBI url overrides the code default.
- **Requests read the settings when they are sent**, not from a render, so the
  refetch after saving new tokens already uses them. Keep that if adding
  fetchers.
- **The service layer must share React and TanStack Query with the app.** It is
  a workspace symlink with its own `node_modules`; `resolve.dedupe` in
  `vite.config.ts` and `paths` in `tsconfig.json` keep a single copy.
