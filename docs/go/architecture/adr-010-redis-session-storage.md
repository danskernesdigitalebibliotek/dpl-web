# Redis-backed session storage

## Context

The Go Next.js app stores authentication state in a server-side session
shared by the two login providers (Adgangsplatformen and Unilogin —
[ADR-005](./adr-005-dual-login-and-publizon-adapter.md)). Until now, the
session was implemented with [`iron-session`](https://www.npmjs.com/package/iron-session):
the entire `TSessionData` payload was encrypted with `GO_SESSION_SECRET` and
stored inside the `go-session` cookie itself.

`TSessionData` carries multiple OAuth artefacts per logged-in user:

- access, refresh, and id tokens for the active provider
- their expiry timestamps
- the Unilogin user info (`sub`, `uniid`, `institutionIds`)
- the patron's display name
- a PKCE `code_verifier` during the in-flight login round-trip
- the library token used for FBI calls

This payload routinely exceeded iron-session's per-cookie size budget.
iron-session compensated by splitting the encrypted blob into multi-part
cookies (`go-session_0`, `go-session_1`, …), and ad-hoc helpers
(`deleteGoSessionCookies()` and the separate `id_token` cookie set by
`setUniloginTokensOnSession`) accumulated to keep cookie headers from
breaking proxies. Every additional field in the session pushed us closer to
hard browser/proxy limits, and the workarounds were getting harder to
reason about.

## Decision

Move the session **payload** to Redis and reduce the cookie to a single
opaque random session ID. The cookie name (`go-session`), hardening
(`httpOnly`, `secure`, `sameSite=lax`), TTL (7 days), and caller-facing API
(`await getSession()` → mutate → `await session.save()`) stay unchanged.

- **Cookie:** `go-session` carries `crypto.randomUUID()` and nothing else.
- **Storage:** ioredis writes `go:session:<id>` → `JSON.stringify(TSessionData)`
  with `EX 604800`. A small JSON reviver rehydrates the `expires` /
  `refresh_expires` `Date` fields on read.
- **TTL:** sliding 7-day window, refreshed on every `save()` (matching
  iron-session's prior maxAge re-issue behaviour).
- **Failure handling:** read errors fall back to the anonymous session
  (matches the prior catch in `getSession()`); write errors throw so login
  and token-refresh flows surface real failures rather than silently
  "succeeding" without persistence.
- **Logout:** `destroy()` now `DEL`s the Redis key as well as clearing the
  cookie. This gives us proper server-side invalidation — a stolen cookie
  no longer remains valid for the full TTL — and it propagates logout
  across tabs and devices on the next request.
- **Rollout:** hard cutover. Existing iron-session cookies become
  unreadable on deploy; affected users re-authenticate.

### Why a dedicated Redis service

Lagoon already runs a Redis instance for the CMS Drupal cache backend
(`docker-compose.lagoon.yml`'s existing `redis:` service). We deliberately
did **not** reuse it. Drupal's cache uses `allkeys-lru` on a small
ephemeral instance sized for cache churn, and session keys living next to
cache entries would have to compete for that memory under load — and would
disappear on container restart.

Instead we provisioned a new `redis-persistent` service using
`uselagoon/redis-8` with `REDIS_FLAVOR=persistent`, giving us a
`redis-persistent` Lagoon type (data survives container restarts), and set
`MAXMEMORYPOLICY=allkeys-lru` so under memory pressure idle sessions are
evicted before active ones — favouring graceful degradation (silent logout
for inactive users) over hard failure (new logins blocked). The service is
named for its persistence semantics rather than its current sole user, so
other workloads that need durable Redis storage (CMS sessions, queues, etc.)
can share the instance without a confusing name.

### Why opaque random IDs, not signed or encrypted IDs

A 128-bit UUID is unguessable; once it leaves the server inside an
`httpOnly`+`secure`+`sameSite=lax` cookie it cannot be forged usefully.
Signing or encrypting the ID — the iron-session pattern — adds CPU cost on
every request without changing the security boundary, since the ID has no
meaning outside the Redis key it indexes.

## Consequences

- The cookie shrinks from kilobytes to ~36 bytes; the multi-part cookie
  workaround retires.
- Logging out is now an effective security operation, not a UI affordance.
- We take a runtime dependency on Redis: every authenticated request hits
  it on read, and login / token-refresh flows hit it on write. The
  middleware (`proxy.ts`) already runs on every non-auth route, so this
  adds one Redis GET to the hot path. Network latency to the in-cluster
  Redis is sub-millisecond and uncontroversial.
- Local development requires a running Redis container
  (`task dev:redis:up` in `go/`); there is no in-memory fallback. The
  Cypress runner needs Redis in CI too (`services:` block in
  `.github/workflows/go-e2e-test.yml`).
- `GO_SESSION_SECRET` is no longer used by the session wrapper. It is left
  in the env schema for now to avoid coordinating its removal across
  Lagoon environment configuration.
- A pre-existing race in `proxy.ts` and `bearer-token.ts:refreshUniloginTokens`
  — two concurrent requests both detecting "token needs refresh" and both
  calling the IdP — is unchanged by this migration. It is documented here
  so a future change can address it.
