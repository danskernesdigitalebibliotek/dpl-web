# AGENTS.md — work-page-poc

Context for working on the work-page proof of concept. Read
[the root `AGENTS.md`](../AGENTS.md) first, then [`README.md`](README.md) for
what this app is, why it's built this way, and its gotchas.

This app lives on a pull request that is never merged. It is a prototype for
the customer, not production code.

## Every rule must show up in the debug panel

The "?" button opens a panel that explains why the page looks as it does. The
customer uses it to check the rules against FBI data, so it must never drift
from what the page does.

- **Decide in resolvers, render the result.** A rule that changes what the page
  shows (which category, which manifestation, which buttons, which texts)
  lives in a pure function that returns both its result and `TraceRow`s
  (`src/work/trace.ts`). The page renders the result; the category's
  `usePageTrace` returns the trace of the same function. Don't decide things
  inside components.
- **Word rules once.** A rule's Danish wording is a constant next to the code
  that applies it (e.g. `accessRules` in
  `src/work/categories/article/accessWays.ts`). Trace rows and the category's
  `rules` list both use that constant.
- **Cite FBI as GraphQL paths**, e.g. `access[0] AccessUrl.status = GONE`. The
  customer knows the FBI types.

## Adding a material category

1. Add a folder under `src/work/categories/` and register the category in
   `registry.ts`, before the catch-rest category.
2. Fill in the whole `ManifestationCategory` contract (`categories/types.ts`):
   `name`, `matchRule` and `match`, a `pickDefault` returning its trace rows,
   `rules` and `usePageTrace`. TypeScript rejects a category without them.
3. Add the category's FBI fields to `src/fbi/documents/workPage.graphql` and run
   `task codegen`.
4. List the category and its example works in the README, and add its open
   questions and untested scenarios to `OPEN-QUESTIONS.md`.

## Conventions

- UI text is Danish; code, comments and docs are English.
- Styling uses the DDF/FBCMS tokens in `src/design-system/theme.css` through
  Tailwind. There is no Preflight, so give elements explicit margins, and use
  `border-b` without `border-solid` (that would style the other sides too).
- Never place real orders or reservations: actions with side effects are
  simulated.
