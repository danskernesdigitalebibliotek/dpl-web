# Authentication

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
