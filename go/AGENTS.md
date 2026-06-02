# AGENTS.md — go

Context for working in **Go** — the Next.js App Router frontend that is
gradually replacing the legacy embedded React apps.

Read [the root `AGENTS.md`](../AGENTS.md) first if you haven't.

## What this is, in one paragraph

Go is a public-facing **Next.js (App Router) site**, aimed at
youth audiences. It is not an embed and not part of the CMS — it reads
content and configuration from the CMS over GraphQL, and talks to the FBI
GraphQL gateway plus REST adapters (FBS, Publizon) and a couple of SOAP
services wrapped server-side. Unlike `/react`, Go owns its own pages and its
own styling stack (Tailwind via `@tailwindcss/postcss` + a CSS-variable
token system; **not** the design system).

## The Server vs. Client boundary

The single most common mistake here is reaching for `"use client"` by
reflex. The intended shape:

- **Default is Server Component.** `page.tsx` / `layout.tsx` are async,
  prefetch via `getQueryClient()` + `HydrationBoundary`, and stream UI
  through `<Suspense>`. `getQueryClient()` is cached per-request — don't
  instantiate a fresh `QueryClient` at the top of a server component.
- **`"use client"` only when needed**: state, effects, browser APIs,
  Radix/keen-slider/framer-motion interactivity, or React Query *hooks*.
- **Server-only modules** declare `"use server"` and are not callable from
  client code (e.g. `lib/config/dpl-cms/dplCmsConfig.ts`,
  `lib/helpers/bearer-token.ts`).
- **No `<main>` inside the app** — use `<section>`. ESLint blocks it; the
  reasoning ties back to the CMS embed history.

## Configuration is two systems, don't confuse them

- **Env vars** are accessed via `getEnv(...)` (public, `NEXT_PUBLIC_*`
  underneath) and `getServerEnv(...)` (server-only). All are Zod-validated
  at startup by `instrumentation.ts`. `process.env.*` is **banned** in
  application code by an ESLint rule — only `lib/config/env.ts` itself
  reads `process.env`.
- **App configuration** (routes, search defaults, service URLs, …) goes
  through the **resolver system** under `lib/config/resolvers/`, accessed as
  `goConfig("routes.user-profile")` server-side or `useGoConfig([...])`
  client-side. See ADR-001. Async resolvers must expose an env-var override.

Lagoon derives the `NEXT_PUBLIC_*` env vars at *container start*, not build
time (see `lagoon/start.sh`). Build artifacts are environment-independent —
don't bake URLs into the build.

## Caching is three independent layers

If you are working with caching, make sure to see ADR-008 and ADR-009.

## Authentication — two providers, one session

Two identity providers, both sharing a single `go-session` cookie. A user
is either one or the other at a time, never both.

- **Adgangsplatformen** — library patrons. Drupal `SSESS*` cookie ties the
  Go session to the CMS session; middleware destroys the Go session if the
  CMS cookie disappears.
- **Unilogin** — students. OpenID Connect + PKCE via `openid-client`. The
  user's first institution's `kommunenr` must match
  `UNILOGIN_MUNICIPALITY_ID`.

If you are doing anything with authentication, make sure to see ADR-005 and [`../docs/go/authentication.md`](../docs/go/authentication.md)

## Where to learn more

- [`../docs/go/`](../docs/go/) — env vars, authentication, cache
  invalidation, expected session behaviour, new-test workflow.
- [`../docs/go/architecture/`](../docs/go/architecture/) — ADRs (config,
  xstate, error boundaries, env vars, dual login, mocking, server mocking,
  caching).
- `package.json`, `next.config.mjs`, `eslint.config.mjs`, `codegen.ts`,
  `orval.config.ts` — sources of truth.
- `lib/config/env.ts` and `lib/config/resolvers/` — the two configuration
  systems described above.
- `proxy.ts` — Next.js middleware (the project names it `proxy`, not
  `middleware`).

## Gotchas worth knowing up front

- **The middleware file is `proxy.ts`, not `middleware.ts`** — extend it,
  don't create a parallel file.
- **`UNLILOGIN_*` is a typo carried through the codebase** (missing an `I`).
  It's load-bearing in production envs — don't "fix" it without a
  coordinated rename across env files, Lagoon, and the Zod schema.
- **XState is scoped to the search feature only** (ADR-002). For
  lightweight global UI state, use the `@xstate/store` stores under
  `store/`.
