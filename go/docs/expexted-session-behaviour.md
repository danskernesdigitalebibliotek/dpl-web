# Expected session behaviour

## The purpose of this document

This document both aims to be a help for developers if unexpected events occurs around
user session handling in production sites but also serves as documentation of
intended session behaviour.

## Terminology

* **Primary Library** - The main library site (FB CMS)
* **Go Site** - the Go web site residing as a subsite of the Primary Library
* Session types - The current available session types are: **Adgangsplatformen**,
**Unilogin** and **anonymous**. **anonymous** is the default type.

## Logged-in identification

**Primary Library**: When a user is logged in, the name of the user is written under
the user icon in the header.

**Go Site**: You can see a user is logged in by clicking on the user icon in the
header.

* If a login sheet is shown with button the user is NOT logged.
* If you are redirected to the profile page the user is logged in.

## Various session rules

* At the Go Site it is NOT possible to be logged in with an Adgangsplatformen
and a Unilogin session at the same time.
* The Unilogin session type only exists at the Go Site
* The Adgangsplatformen session type can be used on both sites and is shared
between the sites.

## User stories

### Shared Adgangsplatformen session between Primary Library and Go Site

The Adgangsplatformen session is shared between the Primary Library site and Go.

Here are the various scenarios:

#### Logging into Primary Library and is automatically logged into Go Site

* A user logs into to the Primary Library
* The user identifies that it is logged in
* The user navigates to the Go Site
* The user identifies that is logged in at the Go Site too

#### Logging into Go Site and is automatically logged into the Primary Library

* A user logs into to the Go Site with Adgangsplatformen
* The user identifies that it is logged in
* The user navigates to the Primary Library
* The user identifies that is logged in at the Primary Library too

### Logging into Go site with either Adgangsplatformen or Unilogin

This works similar for both of the Adgangsplatformen and Unilogin session types:

* A user logs into to the Go Site with Adgangsplatformen
* The user identifies that it is logged in
* The user clicks on the user icon in the header
* The user is now redirected to the user profile page
* The user is not able to switch to the Unilogin session before the use logs out
by clicking at the "Log out" button on the user profile page

### Two different sessions between Go Site and the Primary Library

In one scenario it is possible to have two different sessions between the two sites:

* A user logs into to the Go Site with Unilogin
* The user identifies that it is logged in
* The user navigates to the Primary Library
* The user logs in to the Primary Library with Adgansgplatformen
* The user identifies that it is logged in
* The user navigates back to the Go Site
* The user identifies that it is logged in with Unilogin (?)
* The user navigates back to the Primary Library
* The user identifies that it is logged in with Adgangsplatformen

(?) Unless the user waited too long with going back to the Go Site and the
Unilogin session ran out.
