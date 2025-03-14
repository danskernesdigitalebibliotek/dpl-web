# Authentication

## General

There are two ways of logging into the Go application:

- Via [Adgangsplatformen](https://danbib.dk/login)
- Via [Unilogin](https://viden.stil.dk/display/OFFSKOLELOGIN/Unilogin)

## Go session

The Go session is maintained by using the [iron-session](https://www.npmjs.com/package/iron-session)
tool.
The session data is stored in a cookie encrypted and is only readable server side.
The session architecture was decided upon as a part of developing the Unilogin
login flow which is documented in an [ADR](https://adr.github.io/) in the docs/architecture section.
The go session cookie is used for patrons logging in with either Unilogin or
Adgangsplatformen and has two major attributes:

**isLoggedIn** - can be either `true` or `false`

and

**type** - can be either:

- `anonymous`
- `unilogin`
- `adgangsplatformen`

The overall authorization behavior of the Go application is controlled by these
parameters.

TODO: explain the session fecthing/hook/route thingy

## Go session type cookie

Because we need a different behavior of the application depending of the session
type ("unilogin" or "adgangsplatformen") and we don't want to call our session
endpoint every time we decided to create a cookie called "go-session:type". Since
it is not sensitive data we can make it accessible both client and server side.
The cookie is for instance used to decide whether we need to contacting our own
Pubhub API or the Publizon adapter when requesting Publizon data.

## Login

### Login via Unilogin

The login flow is mainly controlled vi the [openid-client](https://www.npmjs.com/package/openid-client)
package. It is a tool to ease the setup of the Oauth 2 flows.
The decision behind the choice of tools for the login handling is described in an
[ADR](https://adr.github.io/) in the docs/architecture section.

```mermaid
sequenceDiagram
    actor Patron
    participant Go
    participant Unilogin Login
    participant Unilogin WS
    participant Adgangsplatformen
    Patron->>Go: Patron opens the Login sheet
    Patron->>Go: Clicks Unilogin login button
    Go->>Go: Go redirects to login auth route (/auth/login/unilogin)
    Note over Go: See chapter: "Building the Unilogin authorization url"
    Go->>Go: Go builds an authorization url
    Note over Go: code_verifier is used for validating authenticity of the redirect back from the Unilogin login
    Go->>Go: Stores code_verifier value in Go session cookie
    Go->>Unilogin Login: Go is redirecting to the external Unilogin form by using the authorization url
    Unilogin Login->>Go: After successful login the patron is redirected to the unilogin callback route (/auth/callback/unilogin)
    Unilogin WS-->>Go: Go requests access token, refresh token and expire timestamps and validates the expected response
    Note over Unilogin WS: Introspection data contains uniid and institution_ids of the user
    Unilogin WS-->>Go: Go requests and validates introspection data from the access token
    Note over Unilogin WS: Userinfo data contains the sub that in this case is a GUID
    Unilogin WS-->>Go: Go requests and validates user info
    Note over Go: See chapter: "Unilogin login authorization check"
    Go-->>Go: Checks if user is authorized to log in
    Go-->>Go: Saves the go session with tokens and user info
    Go-->>Go: Saves the go session type cookie
    Go-->>Go: Redirects the Patron to the user profile page
```

#### Building the Unilogin authorization url

In order to follow the Oauth2 standard and the Unilogin [STIL specification](https://viden.stil.dk/display/OFFSKOLELOGIN/Implementering+af+tjeneste)
an authorization url is constructed with the help of the openid-client tool.

A PKCE code verifier is generated (the `GO_SESSION_SECRET` is used as salt).

The code verifier is stored in the session for future validation of the
authenticity of the request from Unilogin coming back from the external login form.

And the code verifier is also used in order to create the code challenge needed
as an url parameter for the authorization url.

#### Unilogin login authorization check

As a part of the Unilogin flow when coming back form a successful login we check
if the municipality id (`kommunenr`) of the first institution in the userinfo
matches the one that is configured to the site (`UNILOGIN_MUNICIPALITY_ID`).
If the id's are identical the user is allowed to login in otherwise a logout is
forced both in the SSO and locally.

### Login via Adgangsplatformen

```mermaid
sequenceDiagram
    actor Patron
    participant Go
    participant CMS
    participant CMS Graphql API
    participant Adgangsplatformen
    Patron->>Go: Patron opens the Login sheet
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

    SessionExist -->|No| RedirectToFrontpage
```
