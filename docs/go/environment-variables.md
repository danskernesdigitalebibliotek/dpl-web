# Environment Variables

All environment variables are validated at startup using Zod schemas in `go/lib/config/env.ts`. Public variables are accessed via `getEnv()` and server-only variables via `getServerEnv()`. Validation can be bypassed by setting `SKIP_ENV_VALIDATION=1`.

Storybook automatically forwards all `NEXT_PUBLIC_*` variables to its environment (`.storybook/main.ts`).

## Public Variables (client + server)

Available on both client and server. Accessed via `getEnv()`.

### `NEXT_PUBLIC_APP_URL`

- **Required:** Yes (validated as URL)
- **Example:** `https://dpl-cms.local:3000`

The canonical base URL of the GO frontend itself. The single most widely-used env var in the project.

In production, dynamically set in `lagoon/start.sh` from `LAGOON_DOMAIN` (with `go.` subdomain handling).

### `NEXT_PUBLIC_DPL_CMS_HOSTNAME`

- **Required:** Yes
- **Example:** `dpl-cms.local`

The hostname of the DPL CMS (Drupal) instance.

- **Next.js image config** – used in `next.config.mjs` to build the `remotePatterns` allowlist so Next.js can optimize images served from the CMS. In non-production the hostname is wildcarded.
- **Header link** – rendered as the "parent library" link in `LinkToParentLibrary.tsx`.

In production, set in `lagoon/start.sh` from `LAGOON_DOMAIN`.

### `NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS`

- **Required:** Yes (validated as URL)
- **Example:** `https://dpl-cms.local/graphql`

The full URL of the DPL CMS GraphQL API endpoint.

- **Runtime** – every GraphQL request to DPL CMS goes through this endpoint (`dpl-cms.fetcher.ts`)
- **Codegen** – the `codegen:graphql` script introspects this endpoint to generate TypeScript types (`codegen.ts`)

In production, set in `lagoon/start.sh` from `LAGOON_ROUTE`.

### `NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_NAME`

- **Required:** Yes
- **Example:** `go_graphql`

Username for Basic Auth against the DPL CMS GraphQL API. Combined with the password below to produce a Base64-encoded `Authorization: Basic` header in `dpl-cms.fetcher.ts`. Also used during codegen schema introspection.

### `NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_PASSWORD`

- **Required:** Yes
- **Example:** `oA8mqZFxmFubREH77T3qeApeoUxoNS7Y`

Password counterpart to the GraphQL consumer username above.

### `NEXT_PUBLIC_GRAPHQL_BASIC_TOKEN_DPL_CMS`

- **Required:** No (only in `.env.example`)
- **Example:** `Z29fZ3JhcGhxbDpvQThtcVpGeG1GdWJSRUg3N1QzcWVBcGVvVXhvTlM3WQ==`

**Legacy.** A pre-encoded Basic Auth token. Not referenced in application code — the app computes the token at runtime from the username + password above.

### `NEXT_PUBLIC_PUBHUB_BASE_URL`

- **Required:** No (only in `.env.production`)
- **Example:** `https://pubhub-openplatform.dbc.dk`

Base URL for the PubHub/Publizon OpenPlatform API. Only set in `.env.production`; not validated through `env.ts`. Should probably be removed

### `NODE_ENV`

- **Required:** Yes
- **Values:** `development` | `production` | `test`

Standard Node.js environment indicator. Controls:

- Image optimization (unoptimized outside production) and allowed hostnames (wildcarded outside production) in `next.config.mjs`
- Secure cookie flag on the session cookie (`session.ts`)
- React Query stale time (0 in dev, 1 min in production) (`graphql.ts`)
- Component visibility gating via `withVisibility` HOC (`visibility.tsx`)

### `TEST_MODE`

- **Required:** No (defaults to `false`, coerced to boolean)
- **Values:** `true` / `false`

Enables test-specific behaviour:

- **Unilogin OIDC** – allows insecure (non-HTTPS) requests to the identity broker (`uniloginClient.ts`)
- **SOAP services** – redirects Publizon loan creation and Unilogin institution lookup endpoints to the local mock server (`requests.ts` files)

### `CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI`

- **Required:** No (optional, validated as URL if set)
- **Example:** `https://fbi-api.dbc.dk/ereolgo/graphql`

The FBI (Fælles Biblioteks Infrastruktur) GraphQL endpoint. Used **only** during code generation (`codegen.ts`) to introspect the FBI schema and generate TypeScript types/hooks.

### `CODEGEN_LIBRARY_TOKEN`

- **Required:** No (optional)
- **Example:** `XXX`

Bearer token for authenticating with the FBI GraphQL API during codegen. Sent as `Authorization: Bearer` when introspecting the FBI schema.

## Server-Only Variables

Only available server-side. Accessed via `getServerEnv()`.

### `DRUPAL_REVALIDATE_SECRET`

- **Required:** Yes
- **Example:** `CeXF8E2Rd9wXZ2sswFHR`

Shared secret for on-demand cache revalidation. The `GET /cache/revalidate` route compares the incoming `secret` query parameter against this value; mismatches return 401. This lets DPL CMS trigger Next.js cache invalidation securely.

### `GO_SESSION_SECRET`

- **Required:** Yes (minimum 32 characters)
- **Example:** `yZJhgvvvUYMawDRbdzfdvsVswWXCKwkU`

The encryption password for `iron-session`. Used to seal/unseal the `go-session` cookie that stores all authentication state (tokens, user info, session type). Also used in Cypress E2E setup to create mocked session cookies via `sealData()`.

### `NEXT_PHASE`

- **Required:** No (optional, set automatically by Next.js)
- **Values:** `phase-development-server` | `phase-export` | `phase-production-build` | `phase-production-server` | `phase-test`

Indicates the current Next.js lifecycle phase. The helper `isBuildingGoApp()` in `next-phase.ts` checks for `phase-production-build` — during builds, the session system returns a default anonymous session instead of attempting to read cookies (which aren't available at build time).

### `UNILOGIN_CLIENT_ID`

- **Required:** No (optional)
- **Example:** `https://ereolengo.dk/`

OpenID Connect client ID for the Unilogin identity broker. Used by `openid-client` during OIDC discovery in `uniloginClient.ts`. Can be overridden by this env var; otherwise the value can come from DPL CMS configuration.

### `UNILOGIN_CLIENT_SECRET`

- **Required:** No (optional, can come from DPL CMS private config)
- **Example:** `XXX` (sensitive)

OpenID Connect client secret for Unilogin. If set, overrides the value fetched from DPL CMS private configuration in `dplCmsConfig.ts`.

### `UNILOGIN_WELLKNOWN_URL`

- **Required:** No (optional, validated as URL if set)
- **Example:** `https://broker.unilogin.dk/auth/realms/broker/.well-known/openid-configuration`

The OIDC discovery endpoint for the Unilogin broker. Used by `openid-client` to discover authorization/token endpoints. In test mode, also used as the base URL for mocked SOAP service endpoints (Publizon create-loan, Unilogin institution lookup).

### `UNILOGIN_MUNICIPALITY_ID`

- **Required:** No (optional)
- **Example:** `XXX`

Overrides the municipality ID from DPL CMS public config. Used for Unilogin institution filtering in `getDplCmsPublicConfig()`.

### `UNLILOGIN_PUBHUB_CLIENT_ID`

- **Required:** Yes
- **Example:** `EE939D96-702D-1BEE-AEB2-517B8BA18B11`

Client ID for Publizon/PubHub SOAP services. Passed as `clientid` in service requests (`publizon.ts`).

> **Note:** The `UNLILOGIN_` prefix (rather than `UNILOGIN_`) is a typo that has been carried through the codebase.

### `UNLILOGIN_PUBHUB_RETAILER_ID`

- **Required:** Yes
- **Example:** `XXX`

Retailer ID for Publizon SOAP API calls. Passed as `retailerid` in loan creation and other Publizon requests.

> **Note:** The `UNLILOGIN_` prefix (rather than `UNILOGIN_`) is a typo that has been carried through the codebase.

### `UNLILOGIN_PUBHUB_RETAILER_KEY_CODE`

- **Required:** No (optional, can come from DPL CMS private config)
- **Example:** `XXX` (sensitive)

Retailer key code for Publizon. MD5-hashed at runtime before being sent as `retailerkeycode` in SOAP requests (`publizon.ts`). If set as an env var, overrides the DPL CMS private config value.

> **Note:** The `UNLILOGIN_` prefix (rather than `UNILOGIN_`) is a typo that has been carried through the codebase.

### `UNLILOGIN_SERVICES_WS_USER`

- **Required:** No (optional, can come from DPL CMS private config)
- **Example:** `XXX`

Username for Unilogin SOAP web services (e.g. institution lookups via `wsiinst-v5`). If set, overrides DPL CMS private config.

> **Note:** The `UNLILOGIN_` prefix (rather than `UNILOGIN_`) is a typo that has been carried through the codebase.

### `UNLILOGIN_SERVICES_WS_PASSWORD`

- **Required:** No (optional, can come from DPL CMS private config)
- **Example:** `XXX` (sensitive)

Password for Unilogin SOAP web services. Paired with `UNLILOGIN_SERVICES_WS_USER`. If set, overrides DPL CMS private config.

> **Note:** The `UNLILOGIN_` prefix (rather than `UNILOGIN_`) is a typo that has been carried through the codebase.

## Build / Tooling Variables

Used by scripts and tooling, not by the running application.

### `SKIP_ENV_VALIDATION`

- **Values:** `1` to skip
- **Purpose:** Disables Zod env validation at module load time. Used in the `codegen:graphql` script (`package.json`) so code generation can run without every runtime variable being set.

### `NODE_TLS_REJECT_UNAUTHORIZED`

- **Values:** `0` to disable TLS verification
- **Purpose:** Node.js flag used in dev/test scripts (`dev`, `dev:https`, `start:dev`, `codegen:graphql`) to allow HTTPS connections to servers with self-signed certificates (e.g. local DPL CMS on Docker). **Never set in production.**

### `DEBUG_MOCK_SERVER`

- **Values:** `true` to enable
- **Purpose:** Enables verbose logging for the Cypress mock API server. Used in `cypress:open` scripts. When set, logs every mocked request registration and enables `mockttp` debug mode.

## Lagoon Platform Variables

Provided by the Lagoon hosting environment and consumed in `lagoon/start.sh` to derive runtime env vars:

### `LAGOON_DOMAIN`

The primary domain of the Lagoon environment. Used to derive:

- `NEXT_PUBLIC_APP_URL` — prefixed with `go.` subdomain (handles `www.` prefix)
- `NEXT_PUBLIC_DPL_CMS_HOSTNAME` — set directly

### `LAGOON_ROUTE`

The full route URL (with protocol) from Lagoon. Used to derive:

- `NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS` — appends `/graphql`
