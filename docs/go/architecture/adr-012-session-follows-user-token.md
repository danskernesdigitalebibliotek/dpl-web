# Session Follows the User Token

## Context

The Adgangsplatformen user token cannot be renewed: the CMS stores it at
login and its `dplTokens` GraphQL field returns the stored token verbatim —
there is no refresh mechanism anywhere in the chain. Meanwhile the Drupal
session cookie (`SSESS*`) lives for weeks. That gap caused a broken state:
after the token expired, the middleware would "reload" the same dead token
from the CMS, the header kept showing the user as logged in, and every
`/ap-service/*` call answered 403 in a loop while the profile page hung in
skeletons.

The middleware also only runs on some requests — `/auth`, `/ap-service` and
`/auth/session` are outside its matcher — so expiry handling could not live
in the middleware alone.

## Decision

The GO session lives exactly as long as the Adgangsplatformen user token.
There is no refresh path — a dead token means a new login. A session judged
dead is torn down everywhere, not just in GO:

- `loadUserToken()` treats a token with a past expire timestamp as no token,
  so a lingering Drupal session can never resurrect a dead GO session.
- On document navigations the middleware sends an expired session through
  the full logout flow (`/auth/logout`), tearing down the Drupal session and
  the Adgangsplatformen SSO session too. Other request types fall back to
  local teardown.
- The `/ap-service` proxy checks expiry itself (it sits outside the
  middleware) and destroys the session when the upstream rejects the
  session's own user token with 401/403 — the only check that also catches
  tokens revoked before their expire timestamp. Library-token calls and
  passed-through Authorization headers never touch the session.
- Logouts initiated on the CMS site detour through GO
  (`/go-session-logout` → `/auth/logout/cms`) so the GO session cookie —
  host-only on the GO host, unreachable from the CMS — is cleared as well.

Unilogin sessions are untouched by all of this; they have a real refresh
token and their own lifecycle.

## Consequences

- Users are logged out when the token expires instead of landing in a
  half-dead session. Re-login through Adgangsplatformen is the only way to
  extend a session; while the SSO session is still alive that round trip is
  invisible to the user.
- The shared login state between the CMS site and GO stays consistent in
  both directions on logout.
- Client-side handling of a session that dies on an already-open page (a
  "log in again" state instead of failing queries) is a separate, later
  step.
