# Environment variables

This file documents the environment variables used by DPL CMS. If you
add a new variable, make sure to add it here.

## MariaDB

- `MARIADB_DATABASE`
- `MARIADB_USERNAME`
- `MARIADB_PASSWORD`
- `MARIADB_HOST`
- `MARIADB_PORT`
- `MARIADB_CHARSET`
- `MARIADB_COLLATION`

Standard MariaDB connection settings, provided by Lagoon.

- `MARIADB_DATABASE_OVERRIDE`
- `MARIADB_USERNAME_OVERRIDE`
- `MARIADB_PASSWORD_OVERRIDE`
- `MARIADB_HOST_OVERRIDE`
- `MARIADB_PORT_OVERRIDE`
- `MARIADB_CHARSET_OVERRIDE`
- `MARIADB_COLLATION_OVERRIDE`

Overrides standard database settings; use for database migrations.

## Lagoon

- `LAGOON`

Used by `all.settings.php` to detect Lagoon environment and configure
Drupal.

- `LAGOON_PROJECT`

Lagoon project name, set by Lagoon or locally in docker-compose.yml.

- `LAGOON_ENVIRONMENT`

Environment name, e.g. `master`, `develop`, `local`. This is mostly
the branch name, except in the local development environment.

`GoSite` checks this to set the Go site URL specifically on pull request
environments.

- `LAGOON_ENVIRONMENT_TYPE`

Environment type (`development`, `production`, `ci`, `local`). Used
for switching settings per environment.

- `LAGOON_GIT_SAFE_BRANCH`

Normalized git branch name, used to set cache prefix.

- `LAGOON_ROUTE`

Primary URL of the environment. Set by Lagoon, hardcoded in
docker-compose.yml. Used for determining the URL of Go
(`DplGoServiceProvider`), and the URL of BNF locally
(`local.settings.php`).

- `LAGOON_ROUTES`

All URLs of the environment. Not used at the moment.

- `LAGOON_PR_TITLE`

Title of the Pull Request (PR environments only). Used in
`development.settings.php` to determine if BNF should be configured
with the corresponding `dpl-bnf` environment. `dpl-bnf` only builds
pull-requests whose title starts with `BNF:`.

- `HASH_SALT` Drupal salt for one-time logins and security hashes.

Used for hash salt. If not set, it falls back to `MARIADB_HOST`.
Currently not set.

## Redis

- `REDIS_HOST`

Hostname for the Redis service.

- `REDIS_SERVICE_PORT`

Port for the Redis service.

## CI / System

- `CI`

Flag for Continuous Integration environments; triggers mocks and test
settings.

- `TMP`

System temporary directory, standard Unix variable.

## Secrets & API Keys

- `AZURE_MAIL_CONNECTION_STRING`

Connection string for Azure Communication Services (mailing). Added in
via configuration override, read in
`dpl_mail/src/Config/AzureMailerConfigOverrides.php`. Shouldn't be set
in development environment.

- `BNF_GRAPHQL_CONSUMER_SECRET`

Secret for the BNF GraphQL consumer. Set via update hook. Required:
`dpl_consumers.module` throws if it is unset.

- `BNF_GRAPHQL_CONSUMER_USER_PASSWORD`

Password for the BNF GraphQL consumer user. Needs to match between the
library site and BNF site. Set via update hook. Read in
`dpl_consumers.module`, and used for the Basic auth header in
`bnf/src/SailorEndpointConfig.php`.

- `DATAFORSYNINGEN_TOKEN`

Token for Dataforsyningen, the Danish address lookup API. Applied to
`gsearch.settings` in `all.settings.php` and passed to the patron
registration block (`PatronRegistrationBlock`).

- `DRUPAL_PREVIEW_SECRET`

Shared secret for Next.js preview mode. Read in `dpl_go.deploy.php`,
which requires it in production and stores it as `preview_secret` on the
`next_site` config entity owned by the `drupal/next` contrib module.
Whether preview mode is actually exercised has not been verified — the
value is a short placeholder on every project checked.

- `DRUPAL_REVALIDATE_SECRET`

Shared secret for Next.js on-demand revalidation. Set on the Next site
configuration entity by `dpl_go.deploy.php`, and also read in
`dpl_update.install`. Go validates it on `GET /cache/revalidate`.

- `DPL_GO_BASE_URL`

Used to override the URL of the Go site (`GoSite`). Shared with Go, which
reads the same variable as its own canonical base URL.

- `GO_GRAPHQL_CONSUMER_SECRET`

Secret for the Go GraphQL consumer. Set via update hook. Required:
`dpl_consumers.module` throws if it is unset.

- `NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_PASSWORD`:

Password for the GO GraphQL consumer user. Must match the one Go uses.
Set by update hooks. Read in `dpl_consumers.module` and
`dpl_update.install`; on the Go side `go/lib/config/env.ts` maps it onto
an internal config key named `GO_GRAPHQL_CONSUMER_USER_PASSWORD`. Note
that the unprefixed name is never read from the environment.

- `MOBILE_GRAPHQL_CONSUMER_SECRET`

Secret for the Mobile GraphQL consumer. Set via update hook. Required:
`dpl_consumers.module` throws if it is unset.

- `MOBILE_GRAPHQL_CONSUMER_USER_PASSWORD`

Password for the Mobile GraphQL consumer user. Used for runtime
validation of authorization of mobile clients querying the graphql
API. Read in `dpl_consumers.module`.

- `VIDEOTOOL_PUBLIC_KEY`
- `VIDEOTOOL_PRIVATE_KEY`

Credentials for the Videotool media integration. Applied to
`media_videotool.settings` in `all.settings.php`.

## Authentication (Adgangsplatforme & UniLogin)

These are automatically picked up for configuration (see
`local.settings.php` and `development.settings.php`).

- `OPENID_CLIENT_ID`: Client ID for Adgangsplatformen OIDC.
- `OPENID_CLIENT_SECRET`: Client secret for Adgangsplatformen OIDC.
- `OPENID_AGENCY_ID`: Agency ID for Adgangsplatformen OIDC.
- `UNILOGIN_CLIENT_SECRET`: Client secret for UniLogin API.

And if you need these, grab someone that's worked in the area before
and ask them.

- `UNILOGIN_PUBHUB_RETAILER_KEY_CODE`: Retailer key for PubHub.
- `UNILOGIN_MUNICIPALITY_ID`: Municipality ID for UniLogin.

CMS reads `UNILOGIN_PUBHUB_RETAILER_KEY_CODE`, while Go reads the
misspelled `UNLILOGIN_PUBHUB_RETAILER_KEY_CODE` (a long-standing typo).
`.env.1pass` sets both to the same value for local development, but
only the misspelled name exists as a Lagoon project variable.

UniLogin SOAP webservice access lives in Go, not CMS, and uses
`UNILOGIN_WS_UDBYDERSYSTEM_ID`, `UNILOGIN_WS_PRIVATE_KEY` and
`UNILOGIN_WS_PUBLIC_CERT`. Nothing in CMS reads webservice credentials.
