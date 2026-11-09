# Work-page proof of concept (DDF-794)

A place to try the designer's redesign ideas for the work page against real
materials. It lives on a pull request that is never merged; Lagoon gives that
PR an environment, and this app is one more service in it.

## What it is

- A static Vite + React app. Pages: a plain FBI search (`/`) and the work page
  (`/work/:workId`, with `?manifestationId=` choosing the manifestation shown).
- Catalogue data comes from the PoC's own FBI operations in
  `src/fbi/documents/`, generated into typed documents by `task codegen`.
- Library data (availability, and later reservations and loans) comes from
  `packages/service-layer`.
- Tokens are pasted into the connection panel at the top and kept in
  sessionStorage. A library token shows works and availability; a user token
  adds patron data.
- Tailwind v4 is available without Preflight, so the scaffold keeps the
  browser's default look until a concept brings its own styling.

## Running it

- `task dev` starts the dev server.
- `task build` typechecks and builds `dist/`.
- `task lagoon:build` builds the Lagoon image locally.

## Deployment

`docker-compose.lagoon.yml` has a `work-page-poc` service built from
`lagoon/Dockerfile`: a Node stage builds `dist/`, and Lagoon's nginx image
serves it with a fallback to `index.html` for client-side routes.
