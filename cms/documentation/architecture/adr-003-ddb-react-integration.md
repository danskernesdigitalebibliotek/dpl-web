# Architecture Decision Record: DPL React integration

## Context

The DPL React components needs to be integrated and available for rendering in
Drupal. The components are depending on a library token and an access token
being set in javascript.

## Decision

We decided to download the components with composer and integrate them as Drupal
libraries.

As described in [adr-002-user-handling](architecture/adr-002-user-handling.md)
we are setting an access token in the user session when a user has been through
a succesful login at Adgangsplatformen.

We decided that the library token is fetched by a cron job on a regular basis
and saved in a `KeyValueExpirable` store which automatically expires the token
when it is outdated.

The library token and the access token are set in javascript on the endpoint:
`/dpl-react/user.js`. By loading the script asynchronically when mounting the
components i javascript we are able to complete the rendering.
