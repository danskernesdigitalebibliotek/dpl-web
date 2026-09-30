# Architecture Decision Record: Unilogin Users

Reference: DDF-641.

## Context

Students log in to GO with Unilogin. Adgangsplatformen can use Unilogin as
identity provider, so these logins run through the CMS's existing
Adgangsplatformen client, as patron logins do. GO then fetches the token over
GraphQL.

Following [ADR-002](adr-002-user-handling.md), a login through
Adgangsplatformen creates a Drupal user. Students are not patrons, though, and
the CMS must treat them as anonymous in everything patron-facing. The React
apps don't consult Drupal roles. They decide whether a visitor is logged in
from the token that `/dpl-react/user-tokens` hands them. The login flow also
asked FBS whether the user is registered, and sent anyone who isn't into the
patron registration flow.

## Decision

Unilogin logins get their own access token type, `AccessTokenType::UniloginUser`,
stored by `UniloginUserTokensProvider` in its own temp store collection.

* `/login?idp=unilogin` forces Unilogin as identity provider at
  Adgangsplatformen. GO links to this URL (`goConfiguration.public.loginUrls.unilogin`).
* A login counts as a Unilogin login when the userinfo says Unilogin was the
  identity provider used, or carries a uni-id (see `Drupal\dpl_login\Unilogin`).
  A Unilogin identity that comes back from a plain login through single
  sign-on is recognised too.
* Students are authorized before their Drupal user is created. They need a
  license and an institution, and their first institution must belong to the
  library's municipality or be a DDF test institution. FBS is not called.
* Their token is stored with the Unilogin type, and the FBS lookups and the
  registration flow are skipped. `/dpl-react/user-tokens` only hands out
  `User` and `UnregisteredUser` tokens, so to the React apps a student is
  anonymous.
* GraphQL exposes the token `type`, so GO can tell a student from a patron.
* Students are identified by their hashed uni-id when there is neither a CPR
  number nor a uniqueId.
* New Unilogin users get the `unilogin_patron` role instead of `patron`. The
  role labels the accounts. Its only permission is the GraphQL access GO needs
  to fetch the token.

## Alternatives considered

* **A role alone.** The React apps never look at roles. Every token consumer
  would have to check the role too.
* **Deleting the stored token once GO has it.** Token expiry, remote logout and
  GO's session validation all rely on the stored token.
* **Ending the Drupal session after the hand-off to GO.** This would keep
  students out of Drupal, but GO would need a second session lifecycle and its
  own logout against Adgangsplatformen.

## Consequences

* Expiry, logout and GO's session validation work for students as they do for
  patrons, because the token is still stored.
* Students are authenticated Drupal users. Anything that checks
  `isAuthenticated()` treats them as logged in, for example the "Logged in"
  page title suffix, the no-store cache header and access to the patron page
  routes. Without a user token, none of this gives access to patron data.
* The Unilogin claim names are taken from DBC's documentation and must be
  verified against a real Adgangsplatformen response.
