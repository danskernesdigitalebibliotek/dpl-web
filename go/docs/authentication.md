# Authentication

## General

There are two ways of logging into the Go application:

- Via Adgangsplatformen
- Via Unilogin

### Login via Adgangsplatformen

```mermaid
sequenceDiagram
    actor Patron
    participant Go
    participant CMS
    participant CMS Graphql API
    participant Adgangsplatformen
    Patron->>Go: User navigates to the user profile page
    Note over CMS: The login url contains the route to the login route in the CMS<br/>and a url parameter (current_path which is an internal CMS url) is attached.<br /> current_path instructs the CMS where to go  after the external SSO login
    CMS-->>Go: Go fetches the login url from the CMS
    Patron->>Go: Clicks Adgangsplatformen login button
    Go->>CMS: Go redirects patron to /login at the CMS
    Note over Adgangsplatformen: NB: The Adgangsplagtformen Oauth flow<br />is described in the dpl-cms documenation
    CMS->>Adgangsplatformen: Patron is sent to login form at Adgangsplatformen
    Adgangsplatformen->>CMS: After successful login the patron is redirected to the CMS
    Note over CMS,CMS: The Go specific route<br />(dpl_go.post_adgangsplatformen_login) in the CMS<br />is specified via the current_path url parameter
    CMS->>CMS: The CMS redirects to the Go specific route
    Note over Go: The callback endpoint in Go is at /auth/callback/adgangsplatformen
    CMS->>Go: The CMS redirects to a callback endpoint in Go
    Note over CMS,Go: By passing the Drupal SESS* cookie in the header<br/>Go is authorized and identified as the Drupal Patron user
    CMS Graphql API-->>Go: Go fetches the user token from CMS API
    Go->>Go: Go instantiates a go session with the user token attached
    Go->>Go: Patron is redirected to the user profile page
```

## Logout

When a user click logout we need to handle that the current session either can be:

- Adgangsplatformen
- Unilogin
- Anonymous
- In a, for some reason, broken state

This chart shows how we handle the various types:

```mermaid
flowchart TD
    UserClicksLogout[User clicks logout] -->
    RedirectToLogoutEndpoint[User gets redirected to logout endpoint] -->
    SessionExist{Is there an active go-session?}
    SessionExist --> |Yes| CheckType{Check type}

    CheckType --> IsUnknown[Unknown]
    CheckType --> IsUnilogin[Unilogin]
    CheckType --> IsAdgangsplatformen[Adgangsplatformen]

    IsUnknown --> DestroySession[Destroy Go session - and id token]

    IsAdgangsplatformen --> DestroySessionBeforeRedirect[
      Destroy Go session - and id token, if it exist
    ]
    DestroySessionBeforeRedirect ---> RedirectToAdgangsplatformenLogout[
      Redirect to CMS Adgangsplatformen logout - with current_path url arg
    ]
    RedirectToAdgangsplatformenLogout --> LogoutRemoteAdgangsplatformen[
      Logging out of Adgangsplatformen remotely
    ]
    LogoutRemoteAdgangsplatformen ---> RedirectBackToGo[
      CMS redirects back to Go frontpage
    ]

    IsUnilogin --> CallUniloginLogout[Call Unilogin Logout service]

    CallUniloginLogout --> DestroySession[Destroy Go session - and id token]

    DestroySession --> RedirectToFrontpage[Redirect to frontpage]

    SessionExist ---->|No| RedirectToFrontpage
```
