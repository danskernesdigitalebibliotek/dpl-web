# Unilogin via Adgangsplatformen

## Context

Go had two login pipelines that shared nothing but the `go-session` cookie.
Adgangsplatformen logins ran through the CMS, and the Go session followed the
CMS's user token (ADR-012). Unilogin logins went straight from Go to the STIL
broker. Go ran its own OpenID Connect client (`openid-client`, PKCE, refresh
tokens, an id token cookie for single logout), and a WS-Security-signed SOAP
lookup mapped the student's institution to a municipality.

Adgangsplatformen (login.bib.dk) can use Unilogin as identity provider. Each
library's CMS already has an Adgangsplatformen client with a registered
redirect URI. A Go client of its own would have needed new redirect URIs at
DBC for every Go host, and the library's client secret handed over from the
CMS.

## Decision

**Unilogin logins run through the CMS, like patron logins.** The Unilogin
button sends the student to the CMS login URL from
`goConfiguration.public.loginUrls.unilogin`, which forces Unilogin at
Adgangsplatformen. The CMS checks license, municipality and the test
institution before the student gets a token, so Go does not repeat that
check.

**The token type decides the session type.** The CMS stores a Unilogin login
under its own access-token type, and hands it to Go labelled `unilogin_user`
on `dplTokens.adgangsplatformen.user.type`. `unilogin_user` becomes a
`unilogin` session. `user` and `unregistered_user` become an
`adgangsplatformen` session. Go refuses any other value rather than guess.
The callback and the middleware's anonymous auto-login both create the session
through `saveSessionFromUserToken()`, so a student can never end up with a
patron session.

**Go reads the Unilogin attributes itself.** For a Unilogin token Go fetches
the Adgangsplatformen userinfo with the token and stores the uni-id and
institution ids for the local Pubhub adapter (ADR-005). The first institution
decides where loans go, and DDF's test institution R00263 is mapped to one
Publizon knows. The token is not stored in the session: the student is not a
patron, and the token must never reach FBS or FBI as a user token. No session
is created if the userinfo cannot be read.

**One lifecycle.** ADR-012 now covers both session types. This supersedes its
remark that Unilogin sessions have their own lifecycle. The Go session lives
as long as the token. It ends when the Drupal session cookie disappears, when
the token expires, or when the CMS no longer hands out a token. The 30-second
validation also ends the session when the token's type no longer matches the
session type, for example when a parent logs in on the CMS after a student in
the same browser. Both types log out through the CMS, which ends the single
sign-on session at Adgangsplatformen. A CMS logout ends both types
(`/auth/logout/cms`).

## Consequences

- `openid-client`, PKCE, token refresh, the id token cookie and the STIL SOAP
  client are gone from Go, together with their environment variables.
- Unilogin sessions no longer survive a CMS logout. Logging in on the CMS
  ends a Unilogin session in Go.
- A Unilogin session now lives as long as the Adgangsplatformen token,
  typically until the next morning, instead of a short, refreshed STIL
  session. Shorter sessions on shared school machines would have to be
  enforced by the CMS.
- The old flow forced a fresh STIL login (`prompt=login`). The new flow relies
  on single logout at Adgangsplatformen instead. This must be checked on a
  shared machine during rollout.
- The validation only compares the token type. If one student replaces
  another in the same browser, or one patron replaces another, the old Go
  session lives on until its own token expires. Only the Drupal session's
  token changed.
- When the userinfo lookup fails while the Drupal session lives, the
  middleware tries again on every request from that visitor, who stays
  anonymous.
- The Unilogin claim names match a real userinfo response, and they must stay
  identical in the CMS and in `go/lib/helpers/unilogin.ts`. The institution
  ids come as one string, `"[ABC111,CDA222]"`, or `""` when there are none.
- A student without institutions still gets a session. The CMS decides who
  may log in, and the Pubhub adapter refuses a loan without an institution.
