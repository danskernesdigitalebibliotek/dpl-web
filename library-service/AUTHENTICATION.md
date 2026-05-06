# WeDoBooks Authentication — Findings

## Summary

The SDK requires a **custom sign-in token** to authorize loan and reader operations.
Firebase email/password sign-in authenticates the user but does **not** grant loan
permissions — the custom token carries additional claims (org/library association)
that the Cloud Functions check before allowing loans.

## What we know

### Full auth flow (from API docs + SDK source)

1. **Backend** calls `POST /v1/auth/sign-in` with `{ email, password }` + `x-api-key`
   → returns `{ id_token, expires_in_seconds }`.
2. **Backend** calls `POST /v1/auth/create-sign-in-token` with `{ user_id }` +
   `x-api-key` + `Bearer <id_token>` → returns `{ token, expires_in_seconds }`.
3. **Frontend** calls `service.signIn(token)` which internally runs
   `signInWithCustomToken(auth, token)`.

The custom token is a Firebase custom token (signed JWT from Firebase Admin SDK)
that includes claims linking the user to a specific library/organization.

**Note:** Step 1 is for email/password users. In production with UniLogin,
the backend may skip step 1 and call `create-sign-in-token` directly with the
external user ID + a service-level bearer token.

### REST API endpoints (discovered)

Base URL: **`https://biblio-stage-dk.biblio.wedobooks.io`**
(Same host as the API docs at `/docs`.)

All endpoints require `x-api-key` header.

| Endpoint | Method | Auth | Request body | Response |
|----------|--------|------|-------------|----------|
| `/v1/auth/sign-in` | POST | `x-api-key` | `{ email, password }` | `{ id_token, expires_in_seconds }` |
| `/v1/auth/create-sign-in-token` | POST | `x-api-key` + `Bearer` | `{ user_id (≥20 chars), create_if_not_exists?, user_data? }` | `{ token, expires_in_seconds }` |
| `/v1/auth/create-user` | POST | `x-api-key` + `Bearer` | `{ user_id (≥20 chars) }` | `{ success: true }` |

The `user_data` object on `create-sign-in-token` can include:
`{ type: "library", organization_id, organization_third_party_id, institution_id, tags[] }`

### Staging credentials from WeDoBooks

| Field | Value |
|-------|-------|
| Email | `support@reload.dk` |
| Password | `Preteen_Motto_Unmanned_Playset_Finicky4_Overpass` |
| API key | `AIzaSyBkq7wURQFD6VhjxceLW25GAg50J8kGUg0` |

### SDK config (staging)

```js
{
  applicationId: 'reload-web-app',
  firebaseApiKey: 'AIzaSyBTUdI8XX2hX_M7nQrG8vnhbElzn-QqgTU',
  firebaseProjectId: 'biblio-stage-dk',
  firebaseAppId: '1:474168960596:web:44dfcc412bdf4f6b7c2fc1',
  readerApiKey: 'a1157df4-eb41-4767-8e87-2f9f9a9f4a46',
}
```

### Test data (third-party: test2)

- Ebooks: `9788758841038`, `9788758853147`
- Audiobooks: `9788758855769`

## What we tested

| Action | Result |
|--------|--------|
| SDK init | Works |
| `signInWithEmailAndPassword` (Firebase client SDK) | Works — returns `uid=aWrGCBjcDARp7zHzfrbGbojZRlO2` |
| `sdk.users.signIn(idToken)` | Fails — `INVALID_CUSTOM_TOKEN` (ID tokens are not custom tokens) |
| `POST /v1/auth/sign-in` (via local CORS proxy in dev) | Works — returns `id_token` |
| `POST /v1/auth/create-sign-in-token` | Works — returns custom `token`. With `user_data: { type: "library", organization_third_party_id: "test2" }` and `create_if_not_exists: true`, the token carries org claims. |
| `service.signIn(customToken)` | Works — `success: true`, `uid=aWrGCBjcDARp7zHzfrbGbojZRlO2` |
| `canLoan({ materialId: "9788758855769" })` with org-bearing token | Returns `[{ canLoan: "unavailable", loanProvider: "click", orgId: "x0CRaix5onXIC5cTXkPA", message: "Material 9788758855769 has been restricted: x0CRaix5onXIC5cTXkPA", isDrmEnabled: false }]` — material is in a provider, but our org is explicitly restricted from it |
| `loanBook(isbn)` with org-bearing token | Returns `{ success: false }` — same root cause: org-level material restriction |
| `getLoans(uid)` | Returns `[]` (no active loans yet) |
| Firebase REST API with staging API key | Blocked — `SignInWithPassword` requests blocked on this project (we use the WeDoBooks REST `/v1/auth/sign-in` instead) |

### Note on browser CORS

The WeDoBooks REST API at `biblio-stage-dk.biblio.wedobooks.io` does not allow
browser origins, which is consistent with the production architecture (the Go
backend is meant to do the token exchange server-side). For Storybook testing
in dev, run a local CORS proxy:

```bash
npx local-cors-proxy --proxyUrl https://biblio-stage-dk.biblio.wedobooks.io --port 8010
```

and set `STORYBOOK_WEDOBOOKS_API_BASE_URL=http://localhost:8010/proxy`.

### Why email/password auth alone doesn't enable loans

The SDK uses Firebase Cloud Functions (`httpsCallable`) for loan operations.
These functions check the user's token claims for an `orgId` / library
association. A Firebase email/password sign-in produces a token **without**
these custom claims — only the custom token from
`POST /v1/auth/create-sign-in-token` (with `user_data` populated) includes
them.

Without `user_data` the loan call returned `orgId: null` and
`loanBook → success: false`. With `user_data: { type: "library",
organization_third_party_id: "test2" }`, `orgId` is populated. The remaining
`success: false` is unrelated — it's a catalog-availability problem (open
question 2 below).

## Resolved questions

1. ~~What is the full URL for `POST /v1/auth/create-sign-in-token`?~~
   → `https://biblio-stage-dk.biblio.wedobooks.io/v1/auth/create-sign-in-token`

2. ~~What authentication does the token endpoint require?~~
   → `x-api-key` header + `Authorization: Bearer <id_token>` (from `sign-in`)

3. ~~Is the staging API key for calling this endpoint?~~
   → The `x-api-key` is separate from the Firebase API key. Needs confirmation
   which key value to use (the `AIzaSyBkq7wURQFD6VhjxceLW25GAg50J8kGUg0` key
   is a Google/Firebase key — the WeDoBooks `x-api-key` may be different).

## Remaining questions for WeDoBooks

1. **What is the correct `x-api-key` value for staging?**
   The `AIzaSy…` key looks like a Google API key, not a WeDoBooks API key.
   *(Status 2026-05-06: works against `/v1/auth/sign-in` and
   `/v1/auth/create-sign-in-token`; revisit only if the production key
   issuance pattern differs.)*

2. **The test ISBNs are explicitly restricted for our org.** `canLoan(9788758855769)`
   returns:
   ```json
   {
     "canLoan": "unavailable",
     "loanProvider": "click",
     "orgId": "x0CRaix5onXIC5cTXkPA",
     "message": "Material 9788758855769 has been restricted: x0CRaix5onXIC5cTXkPA",
     "isDrmEnabled": false
   }
   ```
   The material is in provider `click` but the org is blocked from it.
   This is a deliberate WeDoBooks-side configuration (not a token issue,
   not a missing catalog, not a wrong SDK class). We need WeDoBooks to
   either lift the restriction for `x0CRaix5onXIC5cTXkPA` on these ISBNs,
   or provide a non-restricted ISBN so we can exercise `loanBook` →
   `openReader` / `openPlayerBar`. **This is the current blocker for
   finishing the PoC.**

3. **What `applicationId` should we use?** We tested with both `reload-web-app`
   and `test2` — same result.

4. **What `user_id` and `user_data` should we pass to `create-sign-in-token`?**
   *(Partially answered.)* `user_data: { type: "library",
   organization_third_party_id: "test2" }` plus `create_if_not_exists: true`
   produces a token whose `orgId` claim resolves to
   `"x0CRaix5onXIC5cTXkPA"`. Open: in production with UniLogin, what should
   `user_id` be (the UniLogin sub?), and do we need `organization_id` /
   `institution_id` instead of (or in addition to) the third-party id?

## Architecture for production

```
Browser                        Go backend                    WeDoBooks
  │                               │                              │
  │  1. User logs in (UniLogin)   │                              │
  │ ────────────────────────────> │                              │
  │                               │  2. POST /v1/auth/           │
  │                               │     create-sign-in-token     │
  │                               │     { uid }                  │
  │                               │ ───────────────────────────> │
  │                               │                              │
  │                               │  3. { token }                │
  │                               │ <─────────────────────────── │
  │  4. Return token to frontend  │                              │
  │ <──────────────────────────── │                              │
  │                               │                              │
  │  5. service.signIn(token)     │                              │
  │ ──────────────────────────────────────────────────────────>  │
  │                               │                              │
  │  6. service.loanBook(isbn)    │                              │
  │ ──────────────────────────────────────────────────────────>  │
```

Steps 5–6 go directly from the browser to Firebase Cloud Functions (the SDK
handles this internally). The Go backend is only involved in creating the
sign-in token.
