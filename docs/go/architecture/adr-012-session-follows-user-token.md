# Session Follows the User Token

## Context

The Adgangsplatformen user token cannot be renewed: the CMS stores it at
login and there is no refresh mechanism anywhere in the chain. Go copies the
token's expire timestamp into its own session, and the middleware ends the
session once it passes.

A token running out of time is therefore handled on both sides, and the CMS
never serves a dead one: `LogoutExpiredTokensSubscriber` logs out any patron
whose token has expired, so from that point the CMS refuses the session
cookie rather than answering with a stale token.

The broken state came from the other direction. A token can stop working
*before* its expire timestamp — revoked, or invalidated on the CMS side —
and then no clock notices anything: the Go session looks alive, the CMS still
hands the token out, and the only evidence is a service refusing it. That
evidence was being thrown away, because `/ap-service` passed the client's
`Authorization` header straight upstream and treated the resulting 401/403 as
somebody else's business. So the header kept showing the user as logged in
while every `/ap-service/*` call answered 403 in a loop and the profile page
hung in skeletons.

The middleware also only runs on some requests — `/auth`, `/ap-service` and
`/auth/session` are outside its matcher — so the handling could not live in
the middleware alone.

## Decision

**The CMS is the authority on whether the patron still has a session.**
`LogoutExpiredTokensSubscriber` logs out any patron whose token has expired,
on the first request that reaches Drupal — including the one GO makes to read
the token. From then on the CMS answers that cookie with 401/403 rather than
a token, so a dead token cannot travel back to GO.

Given that, the GO session lives exactly as long as the user token. There is
no refresh path — a dead token means a new login:

- `loadUserToken()` returning nothing is the signal that the session is over.
  GO does not second-guess the CMS by re-checking the expiry itself. It does
  distinguish "no token" from "the CMS could not be reached": a 401 or 403 on
  a cookie-authenticated request means the Drupal session is gone, while a
  transport failure says nothing about the patron and must never end a
  session.
- The GO session cookie carries its own copy of the token's expiry, and the
  middleware destroys the session once it passes. That covers a token running
  out of time; a token revoked *before* its expire timestamp is invisible to
  every clock and is only discovered when a service refuses it.
- Drupal can also retire the session while the services still accept the
  token — it logs out patrons with an expired token, and a patron can log out
  on the library site. GO cannot see either, so the middleware asks the CMS
  and ends the session when the answer is "no token". The answer is trusted
  for 30 seconds (`auth.session-validation-ttl-seconds`, recorded as
  `validatedAt` on the session), which bounds the cost without making the
  behaviour depend on the kind of request: branching on that would leave an
  in-app link navigation unchecked while a full page load was checked.
- An expired GO session is destroyed locally by the middleware. The user
  continues on the page they asked for, as an anonymous visitor.
- The Adgangsplatformen SSO session is deliberately left alone. While it is
  alive, logging in again is a round trip the user barely sees.
- The `/ap-service` proxy checks expiry itself (it sits outside the
  middleware) and destroys the session when the upstream rejects the
  session's own user token with 401/403 — the only check that also catches
  tokens revoked before their expire timestamp. The client sends that token
  back in an `Authorization` header on every call, so the proxy compares an
  incoming header against the session's token and treats a match as the
  session's own. Anything else — a library token, someone else's token — is
  passed through and never touches the session. The proxy always decides
  which token goes upstream: the incoming `Authorization` header is dropped
  rather than forwarded.
- Logouts initiated on the CMS site detour through GO
  (`/go-session-logout` → `/auth/logout/cms`) so the GO session cookie —
  host-only on the GO host, unreachable from the CMS — is cleared as well.

Unilogin sessions are untouched by all of this; they have a real refresh
token and their own lifecycle.

## Consequences

- Users are logged out when the token expires instead of landing in a
  half-dead session.
- GO trusts the CMS answer rather than re-deriving validity, so the two stay
  consistent without sharing logic.
- The shared login state between the CMS site and GO stays consistent in
  both directions on logout.
- The browser keeps its `SSESS` cookie until Drupal sees it again, so GO
  re-asks the CMS for a token on later requests and is told "no" each time.
- Client-side handling of a session that dies on an already-open page (a
  "log in again" state instead of failing queries) is a separate, later
  step.
