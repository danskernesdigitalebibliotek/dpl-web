# WeDoBooks Integration — Blocker for Monday

> **Status — 2026-05-06**: API-key gateway block is **resolved**. The full auth
> chain runs end-to-end in Storybook (id_token → custom token →
> `service.signIn` → `success: true`, `orgId: x0CRaix5onXIC5cTXkPA`).
> New blocker: `canLoan` on the test ISBNs returns
> `{ canLoan: "unavailable", message: "Material … has been restricted:
> x0CRaix5onXIC5cTXkPA" }` — the materials are in provider `click` but
> our org is explicitly restricted from them. Reader/player UI can't be
> exercised until WeDoBooks lifts that restriction or provides a
> non-restricted ISBN. See `AUTHENTICATION.md` open question 2.
>
> Dev note: WeDoBooks REST API has no browser CORS, so Storybook needs a
> local proxy (`npx local-cors-proxy --proxyUrl https://biblio-stage-dk.biblio.wedobooks.io --port 8010`)
> and `STORYBOOK_WEDOBOOKS_API_BASE_URL=http://localhost:8010/proxy`. In
> production the Go backend will make these calls server-side and the issue
> won't apply.



## What we're trying to do

We want to test the reader and player from the `@wedobooks/sdk`. To do that we need
to sign in a user, loan a book, and open it in the reader/player.

The SDK docs at https://wdb-web-sdk-docs.web.app/ say:

1. "Use our API to create a sign-in token for your user"
2. Call `sdk.users.signIn(customToken)`

The REST API docs at https://biblio-stage-dk.biblio.wedobooks.io/docs describe the
endpoints we need to call.

## What we tried

### Step 1: Call `POST /v1/auth/sign-in` with email + password

Following the docs, we called:

```bash
curl -X POST https://biblio-stage-dk.biblio.wedobooks.io/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -H "x-api-key: AIzaSyBkq7wURQFD6VhjxceLW25GAg50J8kGUg0" \
  -d '{"email":"support@reload.dk","Preteen_Motto_Unmanned_Playset_Finicky4_Overpass":"..."}'
```

**Result — error:**

```json
{
  "code": 403,
  "message": "PERMISSION_DENIED: API wedobooks-app-api-09gdrbblo88cm.apigateway.biblio-stage-dk.cloud.goog is not enabled for the project."
}
```

We also tried the non-legacy URL (`stage-dk.biblio.wedobooks.io`) and the Firebase
SDK key (`AIzaSyBTUdI8XX2hX_M7nQrG8vnhbElzn-QqgTU`). Same result on all combinations.

### Update — 2026-04-28 (10:55 CET retry)

We re-ran the calls before mailing Jeppe. The errors have shifted, which suggests
something changed on WeDoBooks' side:

- `/v1/auth/sign-in` now returns:

  ```json
  {
    "code": 403,
    "message": "PERMISSION_DENIED:  The API targeted by this request is invalid for the given API key."
  }
  ```

  (Previously the message named the gateway: `"API wedobooks-app-api-09gdrbblo88cm... is not enabled for the project."`)

- `/v1/auth/create-sign-in-token` now returns **401 "Jwt is missing"** — not 403:

  ```json
  { "code": 401, "message": "Jwt is missing" }
  ```

  Response also includes `WWW-Authenticate: Bearer realm="..."`. So the gateway
  accepts our API key on this endpoint and is just asking for a Bearer JWT.

**Implication:** the API key now has *partial* access to the gateway —
`create-sign-in-token` is reachable, but `/v1/auth/sign-in` is still rejected at
the API-key layer. We're stuck in a chicken-and-egg: `create-sign-in-token`
requires the JWT that only `sign-in` can issue, and `sign-in` is blocked.

Same 403 on:

- Alternate host `stage-dk.biblio.wedobooks.io` (without `biblio-` prefix)
- Firebase SDK key `AIzaSyBTUdI8XX2hX_M7nQrG8vnhbElzn-QqgTU` as `x-api-key`

### What the error means

The API key we were given (`AIzaSyBkq7wURQFD6VhjxceLW25GAg50J8kGUg0`) is a valid
Google Cloud API key, but the Google Cloud project it belongs to does not have the
WeDoBooks API Gateway enabled. The full API Gateway ID is:

```
wedobooks-app-api-09gdrbblo88cm.apigateway.biblio-stage-dk.cloud.goog
```

This needs to be enabled in the Google Cloud Console for the project that owns our
API key (project `985999491550`).

### What DOES work

Firebase email/password sign-in works directly via the Identity Toolkit:

```bash
curl -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBTUdI8XX2hX_M7nQrG8vnhbElzn-QqgTU" \
  -H "Content-Type: application/json" \
  -d '{"email":"support@reload.dk","password":"...","returnSecureToken":true}'
```
```bash
curl -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBwyS-e4f9Ju8uoBrzIlVnJmZG4e9TTwlc" \
  -H "Content-Type: application/json" \
  -d '{"email":"support@reload.dk","password":"Preteen_Motto_Unmanned_Playset_Finicky4_Overpass","returnSecureToken":true}'
```

This returns an `idToken` and `uid=aWrGCBjcDARp7zHzfrbGbojZRlO2`. But this token is
a regular Firebase ID token — **not** the custom token the SDK needs. Passing it to
`sdk.users.signIn()` fails with `INVALID_CUSTOM_TOKEN`.

The SDK requires a **custom token** (with org/library claims) that can only come from
the `POST /v1/auth/create-sign-in-token` endpoint — which we can't reach because of
the API key permission error.

## What we need from WeDoBooks

**One thing:** Enable the API Gateway `wedobooks-app-api-09gdrbblo88cm.apigateway.biblio-stage-dk.cloud.goog` for our API key's project, so we can call the `/v1/auth/sign-in` and `/v1/auth/create-sign-in-token` endpoints.

Or if the API key we have is not meant for the REST API, please provide the correct
`x-api-key` value for calling the staging API at `biblio-stage-dk.biblio.wedobooks.io`.

**As of the 2026-04-28 retry**, `create-sign-in-token` now reaches past the API-key
check (returns 401 instead of 403), so it's specifically `/v1/auth/sign-in` that
still needs to be opened for our key.

## What we've built (ready to test once unblocked)

- `library-service/src/wedobooks/auth.ts` — REST API client for `signInWithPassword` and `createSignInToken`
- Storybook smoke story with email/password sign-in form → full auth flow → loan → reader/player
- All code follows the documented API flow and compiles cleanly

Once the API key works, we can test the full flow end-to-end in Storybook.

## Credentials we're using

| What                   | Value                                              |
| ---------------------- | -------------------------------------------------- |
| Email                  | `support@reload.dk`                                |
| Password               | `Preteen_Motto_Unmanned_Playset_Finicky4_Overpass` |
| API key (staging)      | `AIzaSyBkq7wURQFD6VhjxceLW25GAg50J8kGUg0`          |
| Firebase API key (SDK) | `AIzaSyBTUdI8XX2hX_M7nQrG8vnhbElzn-QqgTU`          |
| Firebase project       | `biblio-stage-dk`                                  |
| API docs               | https://biblio-stage-dk.biblio.wedobooks.io/docs   |
| SDK docs               | https://wdb-web-sdk-docs.web.app/                  |
