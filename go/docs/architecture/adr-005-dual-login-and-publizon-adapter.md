# Dual Login and Publizon Adapter

## Context

Our application supports two different authentication mechanisms for users:

- **Adgangsplatformen** — used by library patrons.
- **Unilogin** — a login used by students, particularly children in schools.

Depending on which method is used, the session is established differently and includes a session token that is used to authorize requests to external services.

A key integration in our system is the **Publizon Adapter** ([see documentation here](https://library-api.qa.pubhub.dk/index.html)), a service that acts as a middle layer between us and the **Publizon Pubhub** (a SOAP-based backend-to-backend system). [See documentation here.](https://libraryservices.pubhub.dk/v2_7/) This adapter provides endpoints we use to achieve various things, such as:

- `GET /v1/user/loans` — check current user loans and quotas.
- `GET /v1/products/:identifier` — determine whether a material is cost-free (thus not affecting quotas).

Originally, the Publizon Adapter was only built to work with tokens from Adgangsplatformen. As such, when a request to the Publizon Adapter is made using a bearer token from a Unilogin user session, they are rejected.

We needed a way to support Publizon calls for both login types and ensure our app could keep same functionality in either case.

## Decision

We decided to maintain two parallel integrations Publizon services:

- For **Adgangsplatformen** users, we use the official **external Publizon Adapter** hosted by DBC at `https://pubhub-openplatform.dbc.dk/`.
- For **Unilogin** users, we created a **local Publizon Adapter**, hosted internally in our Next.js backend. This adapter forwards requests to Publizon Pubhub on behalf of the user, as that SOAP service only supports server-to-server communication.

To facilitate this, we:

- Generated a second set of client code for our local adapter using **Orval**, matching the shape of the existing external adapter.
- Created utility hooks that conditionally select the correct query/mutation hook based on session type.

For example:

```ts
const useGetV1UserLoans = withSessionType((cookieType: TSessionType) => {
  if (cookieType === "unilogin") {
    return useGetV1UserLoansLocalAdapter()
  }
  return useGetV1UserLoansAdapter()
})
```

These wrapper hooks are used in components when calling endpoints like `/v1/user/loans`, so that the correct adapter (local or external) is queried transparently depending on the session.

> Note: `withSessionType` is a custom utility that internally uses `useSession()` to extract the login type ("unilogin" or "adgangsplatform") and then returns the result of the appropriate hook.

This structure allows us to:

- Separate external and internal adapter concerns.
- Maintain type safety by relying on generated hooks for both services.
- Avoid dynamic logic in the `fetcher`, where `useSession()` cannot be called (hooks are not usable outside React).

## Alternatives considered

### Dynamic endpoint switching inside `fetcher`

We considered dynamically switching between the external and internal adapter URLs within a custom `fetcher` function based on session type. However, this proved infeasible,
because the session type can only be determined by calling `useSession()`, which is a React hook and cannot be used outside components/hooks.

## Consequences

- We now maintain **two sets of generated code** for Publizon Adapter calls: one for the external adapter and one for the local adapter.
- All usage of these adapters must go through a wrapper hook (like `useGetV1UserLoans`) that abstracts away the logic of which session type is active.
- There is a slight duplication in generated code, but it ensures clarity, type safety, and avoids runtime conditionals in awkward places.
- This setup is extensible if more adapters or session types ever need to be supported — the pattern of routing based on session type can scale.
- We avoid violating React hook rules by containing all session-related logic within components or custom hooks.
