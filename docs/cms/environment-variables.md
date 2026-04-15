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

`GoSite` checks this to set the Go site URL specificly on pull request
enviroments.

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
via configuration override (`AzureMailerConfigOverrides`). Shouldn't
be set in development environment.

- `BNF_GRAPHQL_CONSUMER_SECRET`

Secret for the BNF GraphQL consumer. Set via update hook. Not used.

- `BNF_GRAPHQL_CONSUMER_USER_PASSWORD`

Password for the BNF GraphQL consumer user. Needs to match between the
library site and BNF site. Set via update hook.

- `DRUPAL_PREVIEW_SECRET`

Shared secret for Next.js preview mode. Apparently not used. Set
(once) on the Next site configuration entity.

- `DRUPAL_REVALIDATE_SECRET`

Shared secret for Next.js on-demand revalidation. Set on the Next site
configuration entity.

- `GO_DOMAIN`

Used to override the URL of the Go site. (`GoSite`)

- `GO_GRAPHQL_CONSUMER_SECRET`

Secret for the Go GraphQL consumer. Set via update hook. Not used.

- `NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_PASSWORD`:

Password for the GO GraphQL consumer user. Must match the one Go uses.
Set by update hooks.

- `MOBILE_GRAPHQL_CONSUMER_SECRET`

Secret for the Mobile GraphQL consumer. Set via update hook. Not used.

- `MOBILE_GRAPHQL_CONSUMER_USER_PASSWORD`

Password for the Mobile GraphQL consumer user. Used for runtime
validation of authorization of mobile clients querying the graphql
API.

## Authentication (Adgangsplatformen & UniLogin)

These are read by the `cli-set-openid-settings.sh` and
`cli-set-unilogin-settings.sh` scripts and are deprecated.

If these are needed for development, proper values can be found in
1Password.

- `OPENID_CLIENT_ID`: Client ID for Adgangsplatformen OIDC.
- `OPENID_CLIENT_SECRET`: Client secret for Adgangsplatformen OIDC.
- `OPENID_AGENCY_ID`: Agency ID for Adgangsplatformen OIDC.
- `UNILOGIN_CLIENT_SECRET`: Client secret for UniLogin API.

And if you need these, grab someone that's worked in the area before
and ask them.

- `UNILOGIN_WEBSERVICE_USERNAME`: Webservice username for UniLogin.
- `UNILOGIN_WEBSERVICE_PASSWORD`: Webservice password for UniLogin.
- `UNILOGIN_PUBHUB_RETAILER_KEY_CODE`: Retailer key for PubHub.
- `UNILOGIN_MUNICIPALITY_ID`: Municipality ID for UniLogin.
