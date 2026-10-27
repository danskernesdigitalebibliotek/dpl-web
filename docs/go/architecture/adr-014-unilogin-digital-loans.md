# Unilogin digital loans

## Context

ADR-013 moved Unilogin onto Adgangsplatformen: a student now holds a real
Adgangsplatformen access token, labelled `unilogin_user` and kept on the
session as `userToken`. ADR-012 left digital loans patron-only — a Unilogin
user saw the loan buttons but got a child-friendly error, because the Biblio
adapter authenticated Adgangsplatformen patrons only and `isPatronAuthenticated`
gated every digital query.

Now that a student carries an Adgangsplatformen token, the only thing between
them and a digital loan is the gate, not the token.

## Decision

**A Unilogin user borrows digital materials like a patron.** The existing
`biblio.enabled` flag still decides the track — the Biblio adapter when on,
Publizon until then (ADR-012) — and both tracks now accept a Unilogin session.
No separate flag: whether a student may borrow digitally is the same question
as which adapter answers.

**FBS and FBI stay patron-only.** `getPatronUserToken()` still returns a token
only for an Adgangsplatformen session. A new `getDigitalLoanUserToken()`
returns it for a patron or a Unilogin user, and `getServiceUserToken()` hands
the Biblio adapter the latter and every other service the former. The choice is
keyed on the service, so a Unilogin token reaches the Biblio adapter and
nothing else — the "never to FBS/FBI" rule of ADR-013 holds.

**A second client gate.** `isPatronAuthenticated` was one flag gating the FBS
hooks and the digital hooks alike; flipping it for Unilogin would fire doomed
FBS calls. A new `isDigitalLoanAuthenticated` — a superset, true for a patron
or a Unilogin user — gates the digital hooks and the reader sign-in, while FBS
keeps `isPatronAuthenticated`. It falls back to `isPatronAuthenticated` when
unset, so the React apps, where a Unilogin user is anonymous, are unchanged.

## Consequences

- A digital-loan rejection (401/403 from the Biblio adapter) for a Unilogin
  session does not tear down the session the way a patron token rejection does.
  A Unilogin session's lifecycle stays the CMS's (ADR-013).
- Whether the Biblio adapter accepts a Unilogin-issued Adgangsplatformen token
  — quotas, licenses, the reader/player sign-in — must be confirmed per library
  client with DBC, the way `unilogin_oidc` is.
- Physical loans and reservations still require an Adgangsplatformen login; a
  Unilogin user remains anonymous to FBS.
