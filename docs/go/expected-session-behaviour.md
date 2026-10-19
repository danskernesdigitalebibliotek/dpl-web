# Expected session behaviour

## The purpose of this document

This document both aims to be a help for developers if unexpected events occurs around
user session handling in production sites but also serves as documentation of
intended session behaviour.

## Terminology

- **Primary Library** - The main library site (FB CMS)
- **Go Site** - the Go web site residing as a subsite of the Primary Library
- Session types - The current available session types are: **Adgangsplatformen**,
  **Unilogin** and **anonymous**. **anonymous** is the default type.

## Logged-in identification

**Primary Library**: When a user is logged in, the name of the user is written under
the user icon in the header.

**Go Site**: You can see a user is logged in by clicking on the user icon in the
header.

- If a login sheet is shown with button the user is NOT logged.
- If you are redirected to the profile page the user is logged in.

## Various session rules

- At the Go Site it is NOT possible to be logged in with an Adgangsplatformen
  and a Unilogin session at the same time.
- Both session types run through the Primary Library's login, so a browser
  has one Drupal session, and the Go session follows it.
- The Adgangsplatformen session type can be used on both sites and is shared
  between the sites.
- A Unilogin user is logged in on the Primary Library too, but is shown as
  anonymous in its patron features. The Unilogin session type only exists at
  the Go Site.

## User stories

### Shared Adgangsplatformen session between Primary Library and Go Site

The Adgangsplatformen session is shared between the Primary Library site and Go.

Here are the various scenarios:

#### Logging into Primary Library and is automatically logged into Go Site

- A user logs into to the Primary Library
- The user identifies that it is logged in
- The user navigates to the Go Site
- The user identifies that is logged in at the Go Site too

#### Logging into Go Site and is automatically logged into the Primary Library

- A user logs into to the Go Site with Adgangsplatformen
- The user identifies that it is logged in
- The user navigates to the Primary Library
- The user identifies that is logged in at the Primary Library too

#### Logging out of the Primary Library also logs out the Go Site

- A user is logged in with Adgangsplatformen and has visited the Go Site
- The user clicks logout on the Primary Library
- On the way through the logout flow the Go session is cleared too
  (the browser passes `/go-session-logout` → Go's `/auth/logout/cms`)
- The user identifies that it is logged out on both sites

The same goes for a Unilogin session at the Go Site: it lives on the Drupal
session and ends with it.

#### The user token expires

The user token cannot be renewed, so the Go session lives exactly as long as
the token, for both session types (see ADR-012 and ADR-013). The Drupal
session cookie lives much longer.

- A user logs into the Go Site with Adgangsplatformen or Unilogin
- The user returns after the token has expired (e.g. after a weekend)
- On the next page navigation the Go session is destroyed and the page is
  shown to an anonymous visitor, offering login
- The Drupal session ends too, the next time the CMS sees the session cookie
- The Adgangsplatformen SSO session is left alone, so logging in again is a
  round trip the user barely notices
- Data requests fired with the dead token (e.g. an already-open profile
  page) destroy the Go session as well when the upstream answers 401/403

Expected: the user is never shown as logged in while data calls fail — a
dead token means a new login.

### Logging into Go site with either Adgangsplatformen or Unilogin

This works similar for both of the Adgangsplatformen and Unilogin session types:

- A user logs into to the Go Site with Adgangsplatformen
- The user identifies that it is logged in
- The user clicks on the user icon in the header
- The user is now redirected to the user profile page
- The user is not able to switch to the Unilogin session before the use logs out
  by clicking at the "Log out" button on the user profile page

### Logging into the Primary Library ends a Unilogin session

There is one Drupal session per browser, so a login on the Primary Library
replaces the Unilogin session:

- A user logs into to the Go Site with Unilogin
- The user identifies that it is logged in
- The user navigates to the Primary Library
- The user logs in to the Primary Library with Adgangsplatformen
- The user navigates back to the Go Site
- The Unilogin session is destroyed, because the Primary Library now hands
  out a token of another type
- The user identifies that it is logged in with Adgangsplatformen

The same happens the other way round. If the new login is of the same type,
e.g. one student after another, the old Go session lives on until its own
token expires.

### Unilogin sessions on shared computers

A Unilogin session lives as long as its Adgangsplatformen token, typically
until the next morning. Logging out ends the single sign-on session at
Adgangsplatformen, so the next user on a shared school computer has to log
in again.
